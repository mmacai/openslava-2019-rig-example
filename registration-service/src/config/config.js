const config = {
  port: process.env.PORT || 5000,
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9094',
    clientId: process.env.KAFKA_CLIENT_ID || 'registration-service',
    groupId: process.env.KAFKA_GROUP_ID || 'registration-service',
    destinationTopic: process.env.KAFKA_DESTINATION_TOPIC || 'openslava',
    cloudEventSource: process.env.KAFKA_CLOUD_EVENT_SOURCE || '/registration-service',
    avroEnabled: process.env.KAFKA_AVRO_ENABLED,
    schemaRegistryHost: process.env.KAFKA_SCHEMA_REGISTRY_HOST || 'http://localhost:8081/'
  }
};

module.exports = config;
