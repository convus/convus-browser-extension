#!/bin/bash
NODE_ENV=production yarn build
find ./dist -name ".DS_Store" -delete
cd dist && zip -r ../_builds/new-version.zip *
