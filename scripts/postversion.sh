set -e
echo '--- POSTVERSION --------------------'

echo ' -- Publish to NPM...'
# TODO a way for projects to specify --access, lume/cli #16
npm publish --access public

echo ' -- Push to GitHub...'
git push --follow-tags

echo ' -- Pop any changes that were stashed...'
result=`git stash list | head -n 1`
if [[ $result =~ "LUME_CLI_STASH" ]]; then
	git stash pop || true
	git reset HEAD
	echo '  - Stashed changes popped.'
else
	echo '  - No stashed changes to pop.'
fi

echo '--- POSTVERSION DONE --------------------'
