module.exports = {
	plugins: [
		// Webpack doesn't understand this syntax yet.
		['@babel/plugin-proposal-optional-chaining', {}],
		['@babel/plugin-proposal-nullish-coalescing-operator', {}],
	],
	presets: [
		['@babel/preset-typescript', {isTSX: true, allExtensions: true, onlyRemoveTypeImports: true}],
		['babel-preset-solid', {moduleName: '@lume/element'}],
	],
}
