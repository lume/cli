
const webpack = require('webpack')
let config = require('./webpack.base.config.js')
const CWD = process.cwd()

config = Object.assign({}, config, {
    entry: './node_modules/builder-js-package/test.index.js',
    output: {
        path: CWD,
        filename: 'test.build.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'CWD': CWD,
            }
        })
    ],
    stats: 'errors-only',
})

config.module.rules[0].exclude = [ /node_modules/ ]

module.exports = config
