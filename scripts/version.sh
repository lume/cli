set -e
echo '--- VERSION --------------------'
echo ' -- Add version to source...'
./node_modules/@lume/cli/scripts/version-to-source.js
git add src
echo ' -- Making production build.'
lume build
echo '--- VERSION DONE --------------------'
