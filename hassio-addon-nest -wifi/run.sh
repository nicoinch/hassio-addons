#!/bin/bash
set -e

cd /usr/src/app
cp /data/options.json .

npm install
/usr/src/app/node_modules/.bin/forever index.js