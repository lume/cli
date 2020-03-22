#!/usr/bin/env bash

# NOTE_PATH: We set NODE_PATH to also include the node_modules of the current
# working directory, in case that the CLI is symlinked into a project
# (otherwise Karma or other tooling may not be able to import those
# dependencies because the upward search for node_modules will not include the
# working directory of the project we are running in).
# 
# xvfb-maybe: If we don't have a graphical display, xvfb-maybe will set up an
# X11 emulator, and set the DISPLAY env var for electron so it can run
# "headless".
NODE_PATH=`pwd`/node_modules:$NODE_PATH \
	ELECTRON_DISABLE_SECURITY_WARNINGS=true \
	xvfb-maybe \
	karma start ./node_modules/@lume/cli/config/karma.config.js

RESULT=$?

exit $RESULT
