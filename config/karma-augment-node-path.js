// Most of the time, this doesn't do anything. But when karma-electron (NOTE,
// we're not using Electron anymore, and we'll replace Karma with
// @web/test-runner, but this still works as-is for now) is symlinked into the
// project's node_modules, the regular upward lookup for node_modules will not
// find the project's node_modules, so this explicitly adds that to NODE_PATH.
// The karma.config.js file ensures this is loaded before all test files.

const path = require('path')
process.env.NODE_PATH = path.resolve(process.cwd(), 'node_modules') + ':' + process.env.NODE_PATH
require('module').Module._initPaths()
