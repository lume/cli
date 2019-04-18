const CWD = process.cwd()

const path = require('path')
const babelConfig = require('./babel.config')

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
    // are flattened (f.e. when the ARCHETYPE is not `npm link`ed and using NPM v3+).
    'node_modules',
]

module.exports = {
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
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelConfig,
                    },
                ],
            },
        ],
    },
    devtool: DEV ? 'eval-source-map' : 'source-map',
    mode: DEV ? 'development' : 'production',

    // disable minification, it breaks infamous for some reason
    optimization: { minimize: false },
}
