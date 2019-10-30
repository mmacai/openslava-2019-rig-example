const uuid = require('uuid/v4');

const KafkaClient = require('../libs/kafkaClient/KafkaClient');
const { createMessage } = require('../libs/cloudEvents/cloudEvents');
const config = require('../config/config');
const logger = require('../config/winston');

const REGISTRATION_CONFIRMED = 'com.openslava.registration.confirmed';
const MENTOR_ASSIGNED = 'com.openslava.mentor.assigned';

let kafkaClient;

const mentors = [
  {
    mentorName: 'Mentor 1',
    attendeeName: null
  },
  {
    mentorName: 'Mentor 2',
    attendeeName: null
  },
  {
    mentorName: 'Mentor 3',
    attendeeName: null
  }
];

const handlers = {
  [REGISTRATION_CONFIRMED]: data => {
    const availableMentor = mentors.find(mentor => !mentor.attendeeName);

    if (!availableMentor) {
      logger.warn('No mentor available :(');
      return;
    }

    availableMentor.attendeeName = data.name;
    setTimeout(async () => {
      await produce(MENTOR_ASSIGNED, availableMentor);
    }, 3000);
  }
};

const startKafka = () => {
  kafkaClient = new KafkaClient(config.kafka);
};

const close = () => kafkaClient.close();

const produce = (type, data) => {
  const cloudEvent = createMessage({
    type,
    source: config.kafka.cloudEventSource,
    data
  });
  return kafkaClient.produce(config.kafka.destinationTopic, [
    { key: uuid(), value: JSON.stringify(cloudEvent) }
  ]);
};

const consume = async () => {
  await kafkaClient.consume(
    config.kafka.sourceTopic,
    async ({ topic, partition, message }) => {
      try {
        const { value } = message;
        if (!value) return;

        const valueJSON = JSON.parse(value.toString());
        const { eventType, data } = valueJSON;

        if (eventType in handlers) {
          logger.debug(
            `Consumed message=${value.toString()} from topic=${topic} and partition=${partition}.`
          );
          await handlers[eventType](data);
        } else {
          logger.debug(
            `No handler found for message=${value.toString()} from topic=${topic} and partition=${partition}.`
          );
        }
      } catch (error) {
        throw error;
      }
    }
  );
};

module.exports = {
  close,
  produce,
  consume,
  startKafka,
  REGISTRATION_CONFIRMED,
  MENTOR_ASSIGNED
};
