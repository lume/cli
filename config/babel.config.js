module.exports = {
	// sourceMaps: 'both',
	// ^ This option is both confusing and useless.
	// https://github.com/babel/babel/issues/14943. Instead we use the CLI
	// option --source-maps.

	plugins: [
		['@babel/plugin-transform-typescript', {allowDeclareFields: true}],
		['@babel/plugin-proposal-decorators', {version: '2022-03'}],
		['@babel/plugin-proposal-class-properties', {loose: false}],
		['@babel/plugin-proposal-class-static-block'],
	].map(p => [require.resolve(p[0]), p[1]]),

	presets: [
		['@babel/preset-typescript', {isTSX: true, allExtensions: true, onlyRemoveTypeImports: true}],
		// TODO update to @lume/element/babel-preset, lume/cli issue #7, lume/lume issue #219
		['babel-preset-solid'],
	].map(p => [require.resolve(p[0]), p[1]]),
}
