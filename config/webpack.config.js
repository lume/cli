const path = require('path')
const babelConfig = require('./babel.config')
const bubleConfig = require('./buble.config')
const BabelMinify = require('babel-minify-webpack-plugin')
const camelcase = require('camelcase')

const CWD = process.cwd()

console.log(' --- CWD:', CWD)
console.log(' --------- resolveLoader location: ', path.relative(CWD, path.join(path.dirname(require.resolve('builder-js-package')), 'node_modules')))

const pkg = require(path.resolve(CWD, 'package.json'))
const NAME = camelcase(pkg.name)

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
    plugins: DEV ? [] : [
        new BabelMinify({}, {
            comments: false,
        }),
    ],
}
