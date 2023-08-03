#!/bin/bash
NODE_ENV=production yarn build
find ./dist -name ".DS_Store" -delete
cd dist && zip -r ../_builds/new-version.zip *
cd ..
# For Firefox:
# zip -r _builds/convus-extension-source.zip dist src README.md package.json esbuild.config.mjs
# Firefox note: yarn build, full source code at https://github.com/convus/convus-browser-extension
