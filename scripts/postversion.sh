set -e
echo '--- POSTVERSION --------------------'
echo ' -- Publish to NPM...'
# TODO a way for projects to specify --access
npm publish --access public
echo ' -- Push to GitHub...'
git push --follow-tags
echo ' -- Pop any changes that were stashed...'
if [ -f ./node_modules/builder-js-package/__tmp_stash__ ]; then
	git stash pop || true
	git reset HEAD
	echo '  - Stashed changes popped.'
else
	echo '  - No stashed changes to pop.'
fi
rm -f ./node_modules/builder-js-package/__tmp_stash__
echo '--- POSTVERSION DONE --------------------'
