let config = require('./webpack.base.config.js')
const path = require('path')
const camelcase = require('camelcase')

const CWD = process.cwd()
const pkg = require(path.resolve(CWD, 'package.json'))

// in case a name is scoped, f.e. `@awaitbox/document-ready`
const parts = pkg.name.split('/')
const lastPart = parts[ parts.length - 1 ]

const NAME = camelcase(lastPart)

config = Object.assign({}, config, {
    entry: './src/index.js',
    output: {
        path: CWD,
        filename: 'global.js',
        library: NAME,
        libraryTarget: 'var', // alternative: "window"
    },
})

config.module.rules[0].include = [
    path.resolve(CWD, 'src'),
]

module.exports = config
