set -e
echo '--- POSTVERSION --------------------'
echo ' -- Making production build.'
builder run build
echo ' -- Publish to NPM...'
cp -f .npmignore dist/
cp -f LICENSE dist/
cp -f package.json dist/
cp -f README.md dist/
cd dist/
npm publish
cd ../
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
