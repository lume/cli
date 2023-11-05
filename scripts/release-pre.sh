#!/usr/bin/env bash

set -e
echo '--- PREVERSION --------------------'

if [[ $(git status --porcelain) ]]; then
	echo ""
	echo "Working directory is not clean, quitting."
	echo ""
	exit 1
fi

echo ' -- Clean build outputs...'
# TODO don't run clean if there's no clean script.
npm run clean

echo ' -- Run build...'
npm run build

echo ' -- Run tests...'
npm test

# Double check that the build and test did not create unexpected modifications.
if [[ $(git status --porcelain) ]]; then
	echo ""
	echo "Working directory is not clean after build and test, quitting."
	echo ""
	exit 1
fi

echo '--- PREVERSION DONE --------------------'
