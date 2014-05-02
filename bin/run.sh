#!/bin/bash

export PATH=/usr/local/bin:/bin:/usr/bin
export NODE_PATH=/usr/local/lib/node_modules

git pull
forever start -w lib/app.js
forever list
