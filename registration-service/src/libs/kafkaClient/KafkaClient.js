const { Kafka } = require('kafkajs');
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry');
const uuid = require('uuid/v4');

class KafkaClient {
  constructor(options) {
    if (!options.brokers || !options.clientId || !options.groupId) {
      throw new Error('"brokers", "clientId" and "groupId" are required options.');
    }

    this.options = options;
    this.options.clientId = `${this.options.clientId}-${uuid()}`;

    const config = {
      clientId: this.options.clientId,
      brokers: this.options.brokers.split(','),
      retry: {
        initialRetryTime: 1000,
        retries: 10
      },
      connectionTimeout: 10000
    };

    this.kafka = new Kafka(config);
    this.kafka.logger().info(`Using clientId=${this.options.clientId}`);
    this.producerConnected = false;

    if (options.avroEnabled) {
      this.registry = new SchemaRegistry({ host: options.schemaRegistryHost });
    }
  }

  async produce(topic, message) {
    // Connect only first time and make sure producer is connected before sending any message
    if (!this.producerConnected) {
      this.producer = this.kafka.producer();
      this.producer.on(this.producer.events.CONNECT, async () => {
        await this.producer.connect();
        this.producerConnected = true;
      });
    }

    const { data, ...headers } = message;
    let value;
    let cloudEventsData = {};

    if (this.options.avroEnabled) {
      headers.contentType = 'avro/binary';
      Object.keys(headers).forEach(headerKey => {
        if (typeof headers[headerKey] === 'object') {
          cloudEventsData[`ce-${headerKey}`] = JSON.stringify(headers[headerKey]);
        } else {
          cloudEventsData[`ce-${headerKey}`] = headers[headerKey];
        }
      });
      value = await this.registry.encode(2, data);
    } else {
      value = JSON.stringify(message);
    }

    const messageToSend = [{ key: uuid(), value, headers: cloudEventsData }];

    this.kafka
      .logger()
      .info(
        `Producing ${messageToSend.length} messages=${JSON.stringify(
          messageToSend
        )} to topic=${topic}`
      );

    await this.producer.send({ topic, messages: messageToSend });
    this.kafka.logger().info(`${messageToSend.length} message(s) sent successfully`);
  }

  async consume(topic, callback) {
    this.consumer = this.kafka.consumer({ groupId: this.options.groupId });
    this.kafka.logger().info(`Consuming messages from topic=${topic}`);

    await this.consumer.connect();
    await this.consumer.subscribe({ topic });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { value } = message;
        if (!value) return;

        if (this.options.avroEnabled) {
          const { headers } = message;
          let cloudEventsData = {};
          Object.keys(headers).forEach(headerKey => {
            const keyWithoutPrefix = headerKey.replace('ce-', '');
            cloudEventsData[keyWithoutPrefix] = String(headers[headerKey]);
          });
          const decodedValue = await this.registry.decode(message.value);
          return callback({
            topic,
            partition,
            value: { data: decodedValue, ...cloudEventsData }
          });
        }
        const valueJSON = JSON.parse(String(value));
        return callback({ topic, partition, value: valueJSON });
      }
    });
  }

  async close() {
    this.kafka.logger().info(`Closing event hub client=${this.options.clientId}`);
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    this.kafka.logger().info(`Closed event hub client=${this.options.clientId}`);
  }
}

module.exports = KafkaClient;
