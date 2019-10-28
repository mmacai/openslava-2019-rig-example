const config = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9094',
    clientId: process.env.KAFKA_CLIENT_ID || 'mentor-matching-service',
    groupId: process.env.KAFKA_GROUP_ID || 'mentor-matching-service',
    sourceTopic: process.env.KAFKA_SOURCE_TOPIC || 'openslava',
    destinationTopic: process.env.KAFKA_DESTINATION_TOPIC || 'openslava',
    cloudEventSource: process.env.KAFKA_CLOUD_EVENT_SOURCE || '/mentor-matching-service'
  }
};

module.exports = config;
