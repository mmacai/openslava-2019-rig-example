const config = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9094',
    clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',
    groupId: process.env.KAFKA_GROUP_ID || 'notification-service',
    sourceTopic: process.env.KAFKA_SOURCE_TOPIC || 'openslava',
    destinationTopic: process.env.KAFKA_DESTINATION_TOPIC || 'openslava',
    cloudEventSource: process.env.KAFKA_CLOUD_EVENT_SOURCE || '/notification-service',
    avroEnabled: process.env.KAFKA_AVRO_ENABLED,
    schemaRegistryHost: process.env.KAFKA_SCHEMA_REGISTRY_HOST || 'http://localhost:8081/'
  }
};

module.exports = config;
