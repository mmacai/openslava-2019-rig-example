# Quick start

```sh
./start_local.sh
```

If you want to use also Avro uncomment lines below `<== UNCOMMENT TO USE AVRO ==>` in `docker-compose.yml`.

## Kubernetes

Without Avro at the moment.

```sh
helm init
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator

./start_k8s.sh

kubectl scale deployment/reactive-interaction-gateway --replicas 2

./wipe_k8s.sh
```
