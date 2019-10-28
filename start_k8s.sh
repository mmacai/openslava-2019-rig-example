#!/bin/bash
set -e

helm install incubator/kafka \
--name kafka \
-f ./kafka/chart/values.yaml

helm install ./mentor-matching-service/chart \
--name mentor-matching-service

helm install ./notification-service/chart \
--name notification-service

helm install ./registration-service/chart \
--name registration-service

helm install ./rig/chart \
--name rig

helm install ./frontend/chart \
--name frontend

helm install --name prometheus \
--set server.global.scrape_interval="10s" \
stable/prometheus

helm install --name grafana \
-f datasource-helm.yaml \
stable/grafana

echo "Grafana password: $(kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo)"

echo "Frontend: kubectl port-forward $(kubectl get pods -l 'app=frontend-deployment' -o jsonpath='{.items[0].metadata.name}') 4444:80"
echo "Prometheus: kubectl port-forward $(kubectl get pods -l 'app=prometheus,component=server' -o jsonpath='{.items[0].metadata.name}') 9090"
echo "Grafana: kubectl port-forward $(kubectl get pods -l 'app=grafana,release=grafana' -o jsonpath='{.items[0].metadata.name}') 3000"