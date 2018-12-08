set -e
echo '--- PREVERSION --------------------'
echo ' -- Reset global...'
git reset global.js
git checkout -- global.js || ( true && echo '  - No global to reset.' )
echo ' -- Add any changes to git...'
git add .
echo ' -- Stash any changes...'
if [ ! -z "$(git status --porcelain)" ]; then
	git stash
	touch ./node_modules/builder-js-package/__tmp_stash__
	echo '  - Stashed changes.'
else
	echo '  - No changes to stash.'
	rm -f ./node_modules/builder-js-package/__tmp_stash__
fi
echo ' -- Clean repo...'
git clean -xfd -e node_modules
echo ' -- Run tests...'
npm test
echo '--- PREVERSION DONE --------------------'
