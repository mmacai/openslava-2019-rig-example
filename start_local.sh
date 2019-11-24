#!/bin/bash
set -e

function is_kafka_ready() {
    if [[ -z "$(curl -s http://localhost:8081/subjects)" ]]; then
        # no output - Kafka is not ready yet
        return 1
    else
        # Kafka responds!
        printf "Creating Kafka registry schemas\n"
        curl -d '{"schema":"{\"name\":\"openslava\",\"type\":\"record\",\"fields\":[{\"name\":\"mentorName\",\"type\":\"string\"},{\"name\":\"attendeeName\",\"type\":\"string\"}]}"}' -H "Content-Type: application/vnd.schemaregistry.v1+json" -X POST http://localhost:8081/subjects/openslava-value/versions
        printf "\n"
        curl -d '{"schema":"{\"name\":\"openslava\",\"type\":\"record\",\"fields\":[{\"name\":\"name\",\"type\":\"string\"}]}"}' -H "Content-Type: application/vnd.schemaregistry.v1+json" -X POST http://localhost:8081/subjects/openslava-value/versions
        printf "\n"
        return 0
    fi
}

docker-compose down; docker-compose up -d --build

while ! is_kafka_ready; do
    printf "Waiting for Kafka Schema Registry..\n"
    sleep 1
done