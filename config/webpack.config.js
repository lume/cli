const CWD = process.cwd()

const path = require('path')
const babelConfig = require('./babel.config')
const bubleConfig = require('./buble.config')
//const BabelMinify = require('babel-minify-webpack-plugin')
//const ModuleConcatenationPlugin = require('webpack').optimize.ModuleConcatenationPlugin
const camelcase = require('camelcase')

const pkg = require(path.resolve(CWD, 'package.json'))

// in case a name is scoped, f.e. `@awaitbox/document-ready`
const parts = pkg.name.split('/')
const lastPart = parts[ parts.length - 1 ]

const NAME = camelcase(lastPart)

let DEV = false

// --watch option means dev mode
if (process.argv.includes('--watch')) {
    DEV = true
}

const alsoResolveRelativeToArchetype = () => [
    // when the ARCHETYPE is `npm link`ed, or in older versions of NPM, loaders
    // will be found in the ARCHETYPE's node_modules.
    path.relative(CWD, path.join(path.dirname(require.resolve('builder-js-package')), 'node_modules')),

    // otherwise, loaders can also be found in the app's node_modules when deps
    // are flattened (f.e. when the ARCHETYPE is not `npm link`ed).
    'node_modules',
]

module.exports = {
    entry: './src/index.js',
    output: {
        path: CWD,
        filename: 'global.js',
        library: NAME,
        libraryTarget: 'var', // alternative: "window"
    },
    resolve: {
        modules: alsoResolveRelativeToArchetype(),
    },
    resolveLoader: {
        modules: alsoResolveRelativeToArchetype(),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(CWD, 'src'),
                ],
                use: [
                    {
                        loader: 'buble-loader',
                        options: bubleConfig,
                    },
                    {
                        loader: 'babel-loader',
                        options: babelConfig,
                    },
                ],
            },
        ],
    },
    plugins: [
        //new ModuleConcatenationPlugin(),
    ].concat(DEV ? [
    ] : [
        //new BabelMinify({}, {
            //comments: false,
        //}),
    ]),
    devtool: DEV ? 'eval-source-map' : 'source-map',
}
