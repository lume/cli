set -e
echo '--- VERSION --------------------'
echo ' -- Add version to source...'
./node_modules/builder-js-package/scripts/version-to-source.js
git add src
echo '--- VERSION DONE --------------------'
