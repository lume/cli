module.exports = {
	plugins: [
		// Webpack doesn't understand this syntax yet.
		['@babel/plugin-proposal-optional-chaining', {}],
		['@babel/plugin-proposal-nullish-coalescing-operator', {}],
	].map(p => [require.resolve(p[0]), p[1]]),
	presets: [
		['@babel/preset-typescript', {isTSX: true, allExtensions: true, onlyRemoveTypeImports: true}],
		// TODO update to @lume/element/babel-preset, lume/cli issue #7, lume/lume issue #219
		['babel-preset-solid', {moduleName: '@lume/element'}],
	].map(p => [require.resolve(p[0]), p[1]]),
}
