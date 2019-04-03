#!/usr/bin/env bash

# TODO detect electron location, so it isn't hard-coded. We can use something
# like browser-launcher to detect browsers.

# Creates temporary a .karma-test-build/ folder in the CWD, see
# config/karma.config.js.  If we don't have a graphical display, xvfb-maybe
# will set up an X11 emulator, and set the DISPLAY env var for electron so it
# can run "headless".
xvfb-maybe \
	karma start ./node_modules/builder-js-package/config/karma.config.js
RESULT=$?

# remove the temporary folder
rm -rf ./.karma-test-build

exit $RESULT
