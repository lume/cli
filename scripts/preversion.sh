set -e
echo '--- PREVERSION --------------------'
npm test
echo ' -- Reset global...'
git reset HEAD global.js
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
echo '--- PREVERSION DONE --------------------'
