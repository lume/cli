// @ts-check
const CWD = process.cwd()

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

		files: ['dist/**/*.test.js'],
		preprocessors: {
			'dist/**/*.test.js': ['electron'],
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
