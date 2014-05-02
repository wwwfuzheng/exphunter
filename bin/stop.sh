#!/bin/bash

export PATH=/usr/local/bin:/bin:/usr/bin
export NODE_PATH=/usr/local/lib/node_modules

forever stop lib/app.js
forever list
