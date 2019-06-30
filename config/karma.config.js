const CWD = process.cwd()
const glob = require('globby')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp') // mkdir -p
const rmrf = require('rimraf') // rm -rf
const r = require('regexr').default

const debugMode = !!process.env.KARMA_DEBUG

const testFiles = glob.sync([
    CWD+'/src/**/*.test.js',
    CWD+'/src/**/*.test.ts',
    CWD+'/tests/**/*.js',
    CWD+'/tests/**/*.ts',
])

const config = fs.existsSync(CWD+'/builder.config.js') ? require(CWD+'/builder.config.js') : {}

rmrf.sync( CWD + '/.karma-test-build' )

testFiles.forEach(file => {
    const relativeFile = file.replace(CWD, '')
    const relativePath = dirname(relativeFile)

    mkdirp.sync( CWD + '/.karma-test-build' + relativePath )

    const nodeModulesToCompile = config.nodeModulesToCompile

    fs.writeFileSync( CWD + '/.karma-test-build' + withoutExtention(relativeFile) + '.js', `
        // NOTE, we don't use babel.config.js settings here, we can target a
        // more modern environment.
        require('@babel/register')({
            presets: [ ['@babel/preset-env', { targets: { node: 9 } }] ],
            plugins: [
                // We need to transpile the not-yet-official re-export syntax.
                '@babel/plugin-proposal-export-namespace-from',
                '@babel/plugin-proposal-export-default-from',
            ],
            sourceMap: 'inline',
            ${config.nodeModulesToCompile ? `
                ignore: [
                    // don't compile node_modules except for ones specified in the config
                    ${nodeModulesToCompile.map(moduleName => {
                        return r`/node_modules(?!\/${r.escape(moduleName)}\/)/`
                    })}
                ],
            ` : ''}
        })

        // ability to require/import TypeScript files
        require('ts-node').register({
            typeCheck: false,
            transpileOnly: true,
            files: true,
            ignore: [
                ${r`/node_modules\/(?!except-for-this-module)/`}
            ],

            // manually supply our own compilerOptions, otherwise if we run this file
            // from another project's location then ts-node will use
            // the compilerOptions from that other location, which may not work.
            // TODO augment with custom tsconfig
            compilerOptions: require('${path.resolve(__dirname)}/tsconfig.json').compilerOptions,
        })

        ${debugMode
            
            // in debug mode, don't catch the errors, and set devtools to pause
            // on exceptions
            // ? `require( '${ file }' )`
            ? `require( '${ withoutExtention(file) }' )`
            
            // when not in debug mode, log errors to console so that errors are
            // obvious and well formatted, otherwise they are not formatted and
            // can be missing stack traces due to
            // https://github.com/karma-runner/karma/issues/3296
            : (`
                try {
                    
                    // require( '${ file }' )
                    require( '${ withoutExtention(file) }' )
                    
                } catch( e ) {
                    
                    console.error( e )
                    throw e
                    
                }
            `)
        }
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
        singleRun: debugMode ? false : true,
        concurrency: Infinity,

        basePath: CWD,

        // Set up a "CustomElectron" launcher that extends karma-electron's
        // default "Electron" launcher, so that we can control options
        // (docs: // https://github.com/twolfson/karma-electron/tree/5.1.1#launcher-configuration)
        browsers: ['CustomElectron'],
        customLaunchers: {
            CustomElectron: {
                base: 'Electron',
                
                flags: debugMode ? [
                    // If in debug mode, this makes the electron window visible
                    // so that we can step through tests using devtools
                    '--show'
                    
                    // Alternatively to the --show option, we can use this
                    // option, then open chrome://inspect in Google Chrome and
                    // inspect from there.
                    // '--remote-debugging-port=9222',
                ] : [],
            }
        },
        
        files: [
            '.karma-test-build/**/*.js',
            // '.karma-test-build/**/*.ts',
        ],
        preprocessors: {
            '.karma-test-build/**/*.js': ['electron'],
            // '.karma-test-build/**/*.ts': ['electron'],
        },
        client: debugMode ? {} : {
            // otherwise "require is not defined" in karma-electron
            useIframe: false,
            loadScriptsViaRequire: true,
        },

    })

}

function dirname(fullname) {
    if (typeof fullname !== 'string') throw new TypeError('expected a string')
    const parts = fullname.split('/')
    parts.pop()
    return parts.join('/')
}

function withoutExtention(fileName) {
    const fileParts = fileName.split('.')
    fileParts.pop()
    return fileParts.join('.')
}