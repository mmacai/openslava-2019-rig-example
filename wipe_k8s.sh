#!/bin/bash
set -e

helm ls --all --short | xargs -L1 helm delete --purge