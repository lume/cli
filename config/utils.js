// @ts-check
const path = require('path')
const CWD = process.cwd()

module.exports = {
	/**
	 * Used in Webpack configuration (webpack.config.js and karma.config.js) to
	 * also resolve node_modules of the package this code is in, not just the
	 * project node_modules.
	 */
	alsoResolveRelativeToThisPackage() {
		return [
			// loaders can be found in the app's node_modules when deps
			// are flattened.
			'node_modules',

			// Modules can also be found in cli's node_modules.
			// path.relative(CWD, path.resolve(__dirname, '..', 'node_modules')),
			path.resolve(__dirname, '..', 'node_modules'),
		]
	},
}
