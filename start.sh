#!/bin/bash
export WATCH=true
yarn nodemon --watch esbuild.config.mjs --watch src/ -e html,json,js --ignore 'src/*.js' esbuild.config.mjs
