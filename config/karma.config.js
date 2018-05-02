// TODO detect chrome binary location, so it isn't hard-coded. We can use
// browser-launcher to detect browsers.

const CWD = process.cwd()
const webpackConfig = require('./webpack-test.config.js')

module.exports = function(config) {

    config.set({

        frameworks: ['jasmine'],
        reporters: ['spec'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        // singleRun: false, // Karma captures browsers, runs the tests and exits
        concurrency: Infinity,

        basePath: CWD,

        // Webpack with ChromeHeadless {
        browsers: ['ChromeHeadless'],
        files: [
            'node_modules/builder-js-package/test.index.js',
        ],
        preprocessors: {
            'node_modules/builder-js-package/test.index.js': ['webpack'],
        },
        webpack: webpackConfig,
        webpackMiddleware: { // webpack-dev-middleware config
            stats: webpackConfig.stats,
        },
        // }

        //// karma-electron + karma-babel-preprocessor {
        //browsers: ['Electron'],
        //files: [
            //{ pattern: 'src/**/!(*.test).js', included: false },
            //'src/**/*.test.js',
            //'tests/**/*.js',
        //],
        //preprocessors: {
            //'@(src|test)/**/*.js': ['babel', 'electron'],
            ////'@(src|test)/**/*.js': ['babel'],
        //},
        //client: {
            //// otherwise "require is not defined"
            //useIframe: false,
            //loadScriptsViaRequire: true,
        //},
        //babelPreprocessor: {
            //options: {
                //presets: [
                    //['@babel/preset-env', {
                        //targets: {
                            //node: 6,
                        //},
                        //modules: 'commonjs',
                    //}],
                //],
                //sourceMap: 'inline',
            //},
            //filename: function (file) {
                //return file.originalPath.replace(/\.js$/, '.es5.js');
            //},
            //sourceFileName: function (file) {
                //return file.originalPath;
            //},
        //},
        //// }

    })

}
