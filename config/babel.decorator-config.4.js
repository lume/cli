const base = require('./babel.config.base')

module.exports = {
	plugins: [
		...base.plugins,

		['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
		['@babel/plugin-proposal-class-properties', {loose: false}],
	],
	presets: base.presets,
}
