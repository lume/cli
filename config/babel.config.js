module.exports = {
	babelrc: false,
	plugins: [
		// Handle re-export syntaxes not yet supported by browsers or Webpack. f.e.
		// export * as foo from 'foo'
		// export default from 'foo'
		'@babel/plugin-proposal-export-namespace-from',

		// Object rest spread will be supported in the upcoming Chromium-based
		// Edge, then we can drop it once it has enough adoption.
		'@babel/plugin-proposal-object-rest-spread',

		// TODO JSX support
	],
}
