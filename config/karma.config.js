
const CWD = process.cwd()
const glob = require('globby')
const fs = require('fs')
const mkdirp = require('mkdirp')

const testFiles = glob.sync([
    CWD+'/src/**/*.test.js',
    CWD+'/tests/**/*.js',
])

testFiles.forEach(file => {
    const relativeFile = file.replace(CWD, '')
    const relativePath = dirname(relativeFile)

    mkdirp.sync( CWD + '/.karma-test-build' + relativePath )

    fs.writeFileSync( CWD + '/.karma-test-build' + relativeFile, `
        require('@babel/register')({
            presets: [ ['@babel/preset-env', { targets: { node: 9 } }] ],
            sourceMap: 'inline',
        })

        require( '${ file }' )
    ` )
})

module.exports = function(config) {

    config.set({

        frameworks: ['jasmine', 'stacktrace'],
        reporters: ['spec'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        // singleRun: false,
        concurrency: Infinity,

        basePath: CWD,

        browsers: ['Electron'],
        files: [
            '.karma-test-build/**/*.js',
        ],
        preprocessors: {
            '.karma-test-build/**/*.js': ['electron'],
        },
        client: {
            // otherwise "require is not defined"
            useIframe: false,
            loadScriptsViaRequire: true,
        },

    })

}

function dirname(fullname) {
    const parts = fullname.split('/')
    parts.pop()
    return parts.join('/')
}
