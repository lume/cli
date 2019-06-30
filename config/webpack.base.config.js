const CWD = process.cwd()

const path = require('path')
const babelConfig = require('./babel.config')
const webpack = require('webpack')

let DEV = false

// --watch option means dev mode
if (process.argv.includes('--watch') || process.argv.includes('--dev') || process.env.NODE_ENV.startsWith('dev')) {
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
        extensions: ['.ts', '.js']
    },
    resolveLoader: {
        modules: alsoResolveRelativeToArchetype(),
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelConfig,
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelConfig,
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    plugins: [
        // by default, Webpack uses this plugin in production mode. By
        // specifying it here, we can force it to be used in both dev and prod
        // modes, so that we can ensure consistency and catch errors while in
        // dev that we otherwise may not catch if the prod environment is too
        // different.
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    devtool: DEV ? 'source-map' : 'source-map',
    // mode: DEV ? 'development' : 'production',
    mode: 'production',
    optimization: {
        // minimize: DEV ? false : true
        minimize: false
    }
}
