const base = require('./babel.config.base')

module.exports = {
	plugins: [
		...base.plugins,

		['@babel/plugin-transform-typescript', {allowDeclareFields: true}],
		['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
		['@babel/plugin-proposal-class-properties', {loose: true}],
	],
	presets: base.presets,
}
