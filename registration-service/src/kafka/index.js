const uuid = require('uuid/v4');

const KafkaClient = require('../libs/kafkaClient/KafkaClient');
const { createMessage } = require('../libs/cloudEvents/cloudEvents');
const config = require('../config/config');

const REGISTRATION_CONFIRMED = 'com.openslava.registration.confirmed';

let kafkaClient;

const startKafka = () => {
  kafkaClient = new KafkaClient(config.kafka);
};

const close = () => kafkaClient.close();

const produce = (type, data, correlation) => {
  const cloudEvent = createMessage({
    type,
    source: config.kafka.cloudEventSource,
    data,
    extensions: { rig: { correlation } }
  });
  return kafkaClient.produce(config.kafka.destinationTopic, [
    { key: uuid(), value: JSON.stringify(cloudEvent) }
  ]);
};

module.exports = {
  close,
  produce,
  startKafka,
  REGISTRATION_CONFIRMED
};
