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

echo ' -- Run tests...'
npm test

# undo any changes in case test build output is non-deterministic
git checkout .

echo '--- PREVERSION DONE --------------------'
