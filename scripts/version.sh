set -e
echo '--- VERSION --------------------'
echo ' -- Add version to source...'
./node_modules/builder-js-package/scripts/version-to-source.js
git add src/index.js
echo ' -- Making production build.'
builder run build:prod
echo ' -- Add changes to global.js if any...'
git add -f global.js global.js.map || true
echo '--- VERSION DONE --------------------'
