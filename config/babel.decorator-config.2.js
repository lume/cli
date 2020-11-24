const base = require('./babel.config.base')

module.exports = {
	plugins: [
		...base.plugins,

		['@babel/plugin-transform-typescript', {allowDeclareFields: true}],
		['@babel/plugin-proposal-decorators', {legacy: true}],
		['@babel/plugin-proposal-class-properties', {loose: false}],
	],
	presets: base.presets,
}
