#!/usr/bin/env bash

# TODO detect electron location, so it isn't hard-coded. We can use something
# like browser-launcher to detect browsers.

# creates temporary a .karma-test-build/ folder in the project
karma start --single-run ./node_modules/builder-js-package/config/karma.config.js
RESULT=$?

# remove the temporary folder
rm -rf ./.karma-test-build

exit $RESULT
