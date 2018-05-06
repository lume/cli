#!/usr/bin/env bash

# TODO detect electron location, so it isn't hard-coded. We can use something
# like browser-launcher to detect browsers.

# creates temporary a .karma-test-build/ folder in the project
ELECTRON_BIN=./node_modules/.bin/electron ./node_modules/.bin/xvfb-maybe ./node_modules/.bin/karma start --single-run --browsers Electron ./node_modules/builder-js-package/config/karma.config.js
RESULT=$?

# remove the temporary folder
rm -rf ./.karma-test-build

exit $RESULT
