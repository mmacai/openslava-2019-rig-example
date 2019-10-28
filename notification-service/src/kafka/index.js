const uuid = require('uuid/v4');
const CronJob = require('cron').CronJob;

const KafkaClient = require('../libs/kafkaClient/KafkaClient');
const { createMessage } = require('../libs/cloudEvents/cloudEvents');
const config = require('../config/config');
const logger = require('../config/winston');

const NOTIFICATION_ACKNOWLEDGED = 'com.openslava.registration.acknowledged';
const MENTOR_ASSIGNED = 'com.openslava.mentor.assigned';
const REGISTRATION_CONFIRMED = 'com.openslava.registration.confirmed';

let kafkaClient;

const jobs = {};

const handlers = {
  [REGISTRATION_CONFIRMED]: async data => {
    logger.info(
      `Registration confirmed for attendee="${data.name}" > scheduling email notification`
    );
    const date = new Date();
    date.setSeconds(date.getSeconds() + 30);
    const job = new CronJob(date, () => {
      logger.info(`No acknowledgment from attendee="${data.name}" > sending an email`);
      Reflect.deleteProperty(jobs, data.name);
    });
    jobs[data.name] = job;
    job.start();
    logger.info(`Email notification for attendee="${data.name}" scheduled`);
  },
  [MENTOR_ASSIGNED]: async data => {
    logger.info(
      `mentor="${data.mentorName}" assigned to attendee="${data.attendeeName}" > sending an email to organisation team`
    );
  },
  [NOTIFICATION_ACKNOWLEDGED]: async data => {
    logger.info(
      `Notification with message="${data.message}" acknowledged by attendee="${data.name}" > canceling email notification`
    );
    const job = jobs[data.name];
    if (job) {
      job.stop();
      Reflect.deleteProperty(jobs, data.name);
      logger.info(`Email notification for attendee="${data.name}" canceled`);
    }
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
        const { type, data } = valueJSON;

        if (type in handlers) {
          logger.debug(
            `Consumed message=${value.toString()} from topic=${topic} and partition=${partition}.`
          );
          await handlers[type](data);
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
  startKafka
};
