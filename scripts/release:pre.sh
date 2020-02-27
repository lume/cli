set -e
echo '--- PREVERSION --------------------'
echo ' -- Add any changes to git...'
# TODO prompt about stashing
git add .
echo ' -- Stash any changes...'
if [ ! -z "$(git status --porcelain)" ]; then
	git stash
	touch ./node_modules/.__tmp_stash__
	echo '  - Stashed changes.'
else
	echo '  - No changes to stash.'
	rm -f ./node_modules/.__tmp_stash__
fi
echo ' -- Clean repo...'
npm run clean
echo ' -- Run tests...'
npm test
echo '--- PREVERSION DONE --------------------'
