#!/bin/bash
set -e

printenv
curl -X GET -H "Authorization: Bearer $SUPERVISOR_TOKEN" -H "Content-Type: application/json" http://supervisor/core/api/config
echo "SUPERVISOR_TOKEN $SUPERVISOR_TOKEN"

cd /usr/src/app
cp /data/options.json .

npm install
/usr/src/app/node_modules/.bin/forever index.js