// @ts-check
const path = require('path')
const CWD = process.cwd()

module.exports = {
	/**
	 * Used in Webpack configuration (webpack.config.js and karma.config.js) to
	 * also resolve node_modules of the package this code is in, not just the
	 * project node_modules.
	 */
	alsoResolveRelativeToArchetype() {
		return [
			// when the ARCHETYPE is `npm link`ed, or in older versions of NPM, loaders
			// will be found in the ARCHETYPE's node_modules.
			path.relative(CWD, path.join(path.resolve(__dirname, '..'), 'node_modules')),

			// otherwise, loaders can also be found in the app's node_modules when deps
			// are flattened (f.e. when the ARCHETYPE is not `npm link`ed and using NPM v3+).
			'node_modules',
		]
	},
}
