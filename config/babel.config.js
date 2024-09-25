module.exports = {
	// sourceMaps: 'both',
	// ^ This option is both confusing and useless.
	// https://github.com/babel/babel/issues/14943. Instead we use the CLI
	// option --source-maps.

	plugins: [
		['@babel/plugin-transform-typescript', {allowDeclareFields: true}],
		['@babel/plugin-proposal-decorators', {version: '2023-11'}],
	].map(p => [require.resolve(p[0]), p[1]]),

	presets: [
		[
			'@babel/preset-typescript',
			{isTSX: true, allExtensions: true, onlyRemoveTypeImports: true, allowDeclareFields: true},
		],
		['babel-preset-solid'],
	].map(p => [require.resolve(p[0]), p[1]]),
}
