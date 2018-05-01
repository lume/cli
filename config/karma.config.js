const CWD = process.cwd()
const path = require('path')

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

        files: [
            { pattern: 'src/**/!(*.test).js', included: false },
            'src/**/*.test.js',
            'tests/**/*.js',
        ],

        browsers: ['Electron'],
        preprocessors: {
            '@(src|test)/**/*.js': ['babel', 'electron'],
            //'@(src|test)/**/*.js': ['babel'],
        },
        client: {
            // otherwise "require is not defined"
            useIframe: false,
            loadScriptsViaRequire: true,
        },

        babelPreprocessor: {
            options: {
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            node: 6,
                        },
                        modules: 'commonjs',
                    }],
                ],
                sourceMap: 'inline',
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            },
        },

    })

}
