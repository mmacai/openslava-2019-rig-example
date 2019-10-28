const { Kafka } = require('kafkajs');
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
  }

  async produce(topic, messages) {
    // Connect only first time and make sure producer is connected before sending any message
    if (!this.producerConnected) {
      this.producer = this.kafka.producer();
      this.producer.on(this.producer.events.CONNECT, async () => {
        await this.producer.connect();
        this.producerConnected = true;
      });
    }

    this.kafka
      .logger()
      .info(
        `Producing ${messages.length} messages=${JSON.stringify(
          messages
        )} to topic=${topic}`
      );
    await this.producer.send({ topic, messages });
    this.kafka.logger().info(`${messages.length} message(s) sent successfully`);
  }

  async consume(topic, callback) {
    this.consumer = this.kafka.consumer({ groupId: this.options.groupId });
    this.kafka.logger().info(`Consuming messages from topic=${topic}`);

    await this.consumer.connect();
    await this.consumer.subscribe({ topic });
    await this.consumer.run({ eachMessage: callback });
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
