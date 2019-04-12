
const CWD = process.cwd()

module.exports = function(config) {

    config.set({

        frameworks: ['jasmine', 'stacktrace'],
        reporters: ['progress'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        singleRun: true,
        concurrency: Infinity,

        basePath: CWD,
        browsers: ['ChromeHeadless'],
        
        files: [
            'tests/**/*.js',
        ],

    })

}
