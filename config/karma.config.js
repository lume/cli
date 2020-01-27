// @ts-check
const CWD = process.cwd()
const glob = require('globby')
const fs = require('fs')
const mkdirp = require('mkdirp') // mkdir -p
const rmrf = require('rimraf') // rm -rf
const r = require('regexr').default

// disable electron security warnings, because we're loading our own
// files, nothing from the web.
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
console.log('##################################################################')
console.log(
	'NOTE: You may see Electron security warnings for local files. These are harmless, as they are not from the web.',
)
console.log('##################################################################')
console.log('')

const debugMode = !!process.env.KARMA_DEBUG

const testFiles = glob.sync([CWD + '/dist/**/*.test.js'])

const builderConfig = require('./getBuilderConfig')

rmrf.sync(CWD + '/.karma-test-build')

testFiles.forEach(file => {
	const relativeFile = file.replace(CWD, '')
	const relativePath = dirname(relativeFile)

	mkdirp.sync(CWD + '/.karma-test-build' + relativePath)

	const modules = builderConfig.nodeModulesToCompile

	fs.writeFileSync(
		CWD + '/.karma-test-build' + withoutExtention(relativeFile) + '.js',
		`
            // NOTE, we don't use babel.config.js settings here, we can target a
            // more modern environment.
            require('@babel/register')({
                presets: [ ['@babel/preset-env', { targets: { node: 9 } }] ],
                plugins: [
                    // We need to transpile the not-yet-official re-export syntax.
                    '@babel/plugin-proposal-export-namespace-from',
                ],
                sourceMap: 'inline',
                ${
					modules
						? `
                            ignore: [
                                // don't compile node_modules except for ones specified in the config
                                ${r`/node_modules(?!\/(${modules.map(m => r.escape(m) + '|').join('')})\/)/`}
                            ],
                        `
						: ''
				}
            })

            ${
				debugMode
					? // in debug mode, don't catch the errors, and set devtools to pause
					  // on exceptions
					  // ? `require( '${ file }' )`
					  `require( '${withoutExtention(file)}' )`
					: // when not in debug mode, log errors to console so that errors are
					  // obvious and well formatted, otherwise they are not formatted and
					  // can be missing stack traces due to
					  // https://github.com/karma-runner/karma/issues/3296
					  `
                        try {
                            
                            // require( '${file}' )
                            require( '${withoutExtention(file)}' )
                            
                        } catch( e ) {
                            
                            console.error( e )
                            throw e
                            
                        }
                    `
			}
        `,
	)
})

module.exports = function(config) {
	config.set({
		frameworks: ['jasmine', 'stacktrace'],
		reporters: ['spec'],
		port: 9876, // karma web server port
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

				flags: debugMode
					? [
							// If in debug mode, this makes the electron window visible
							// so that we can step through tests using devtools
							'--show',

							// Alternatively to the --show option, we can use this
							// option, then open chrome://inspect in Google Chrome and
							// inspect from there.
							// '--remote-debugging-port=9222',
					  ]
					: [],
			},
		},

		files: ['.karma-test-build/**/*.js'],
		preprocessors: {
			'.karma-test-build/**/*.js': ['electron'],
		},
		client: debugMode
			? {}
			: {
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
