#!/bin/bash
export WATCH=true
yarn nodemon --watch esbuild.config.js --watch src/ -e html,json,js --ignore 'src/*.js' esbuild.config.js
