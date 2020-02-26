#!/usr/bin/env bash

# If we don't have a graphical display, xvfb-maybe will set up an X11 emulator,
# and set the DISPLAY env var for electron so it can run "headless".
xvfb-maybe \
	karma start ./node_modules/builder-js-package/config/karma.config.js
RESULT=$?

exit $RESULT
