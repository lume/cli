#!/usr/bin/env bash

set -e
echo '--- VERSION --------------------'
echo ' -- Add version to source...'
./node_modules/@lume/cli/scripts/version-to-source.js
git add .
git status
echo ' -- Making production build.'
lume build
git add .
git status
echo '--- VERSION DONE --------------------'
