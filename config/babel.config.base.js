module.exports = {
	plugins: [],
	presets: [
		['@babel/preset-typescript', {isTSX: true, allExtensions: true, onlyRemoveTypeImports: true}],
		// TODO update to @lume/element/babel-preset, lume/cli issue #7, lume/lume issue #219
		['babel-preset-solid', {moduleName: '@lume/element'}],
	].map(p => [require.resolve(p[0]), p[1]]),
}
