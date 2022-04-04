#!/usr/bin/env bash

set -e
echo '--- PREVERSION --------------------'

echo ' -- Add any changes to git...'
# TODO prompt about stashing
git add .

echo ' -- Stash any changes...'

result=`git stash -m LUME_CLI_STASH`
if [[ $result =~ 'No local changes' ]]; then
	echo '  - No changes to stash.'
else
	echo '  - Changes stashed.'
fi

echo ' -- Clean repo...'
# TODO don't run clean if there's no clean script.
npm run clean

echo ' -- Run tests...'
npm test

# add one more time in case the build (ran by npm test) has inconsistent output
# that might causes artifact to change each time.
git add .

echo '--- PREVERSION DONE --------------------'
