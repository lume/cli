// @ts-check
const CWD = process.cwd()
const debugMode = !!process.env.KARMA_DEBUG
const path = require('path')
const makeNodeExternalsFunction = require('webpack-node-externals')
const nodeExternals = makeNodeExternalsFunction()
const utils = require('./utils')

// TODO, once Electron supports native Node ES Modules, then we should remove
// all the Webpack stuff from here and loade ES Modules natively.

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
							// so that we can step through tests using Chromium devtools
							//
							// TODO, when we upgrade to a newer version of
							// karma-electron, we'll need to use the "show"
							// option in browserWindowOptions instead.
							'--show',

							// Alternatively to the --show option, we can use this
							// option, then open chrome://inspect in Google Chrome and
							// inspect from there.
							// '--remote-debugging-port=9222',
					  ]
					: [],

				// TODO, When we upgrade to a newer version of karma-electron,
				// we'll need to explicitly enable Node integration with these options.
				// browserWindowOptions: {
				// 	nodeIntegration: true,
				// 	nodeIntegrationInWorker: true,
				// 	nodeIntegrationInSubFrames: true,
				// },
			},
		},

		// We need Webpack support because the code running through Karma uses
		// ES Module syntax. Once native ES Modules are released in Electron,
		// then karma-webpack will no longer be a requirement and test code will
		// run as-is without any bundling needed.
		webpack: {
			// Make it FAST with development mode, for testing purposes. We
			// don't need to compile test code in production mode with
			// minification or other features that will slow tests down. All we
			// want is to bundle each test's dependencies (unit tests should
			// have minimal dependencies, and not import the entire library
			// being tested, only import specific parts being tested) and send
			// it to the browser.
			mode: 'development',

			// Note, the source map must be inline for karma-sourcemap-loader to
			// pick it up from karma-webpack.
			//
			// If we don't specify this, the default is a devtool that uses
			// eval(), which can be a difficult to debug with (but faster to
			// build). A non-eval option, like 'inline-source-map' option makes
			// the debugging experience better.
			devtool: 'inline-source-map',

			resolve: {
				modules: utils.alsoResolveRelativeToThisPackage(),
			},
			resolveLoader: {
				modules: utils.alsoResolveRelativeToThisPackage(),
			},

			output: {
				// This ensures that any modules listed in externals are
				// imported using CommonJS require calls.
				libraryTarget: 'commonjs2',
			},

			// ignore Node libs that don't need to be bundled, as well as
			// anything in node_modules, because they'll be require'd. We want
			// to bundle only our code.
			// TODO set this if user config option "node" is true
			externals: [
				...require('module').builtinModules,

				// immediately-invoked function, to enclose cache variables
				(function() {
					// this caches any modules (positively matched to be ES
					// Module packages) that have already been handled by the
					// following externals function.
					const cache = new Set()

					/**
					 * This checks if a module is an ES Module package, and if it is then
					 * does not treat it as an external, otherwise it treats
					 * everything else as an external with webpack-node-externals.
					 *
					 * @param {any} context
					 * @param {string} request
					 * @param {{ (): void; (error: any, result: any): void; }} callback
					 */
					async function nodeExternalsExceptESModules(context, request, callback) {
						try {
							if (cache.has(request)) {
								callback()
								return
							}

							// If the path is relative or absolute...
							if (['.', '/'].some(c => request.startsWith(c))) {
								// ...pass through to nodeExternals.
								nodeExternals(context, request, callback)
								return
							}

							const moduleName = request.split('/')[0]

							// If the module name is empty...
							if (!moduleName) {
								// ...pass through to nodeExternals.
								nodeExternals(context, request, callback)
								return
							}

							let resolvedPath = ''

							// If the module doesn't exist...
							try {
								resolvedPath = require.resolve(moduleName)
							} catch (e) {
								// ...pass through to nodeExternals.
								nodeExternals(context, request, callback)
								return
							}

							// TODO, on Windows this will start with a backslash. Does it need the C: prefix too?
							const resolvedPathAllPlatforms = path.sep + path.join(...resolvedPath.split('/'))

							// In case the require.resolve path is something like
							// /path/to/node_modules/moduleName/dist/foo.js, we just
							// want /path/to/node_modules/moduleName.
							const modulePath = path.join(resolvedPathAllPlatforms.split(moduleName)[0], moduleName)

							const pkgPath = path.join(modulePath, 'package.json')
							const fs = require('fs').promises
							const pkg = JSON.parse((await fs.readFile(pkgPath)).toString())

							// If we encounter a package published as ES Modules...
							if (pkg.type === 'module') {
								// ...tell Webpack to skip it with no callback args.
								// It will not be treated as an external module,
								// therefore it will be bundled, and therefore the
								// ES Module syntax will be handled by Webpack
								// instead of tripping karma-electron.
								cache.add(request)
								callback()
								return
							}

							nodeExternals(context, request, callback)
						} catch (e) {
							console.error(e)
							throw e
						}
					}

					return nodeExternalsExceptESModules
				})(),
			],

			module: {
				rules: [
					{
						// The source-map-loader tells Webpack to load source
						// maps for any input files. This way the output that
						// Karma will read has source maps that map back to our
						// original source files. Karma-sourcemap-loader will
						// finally read the source maps so that error messages
						// and stack traces from test code shows the correct
						// line numbers.
						test: /\.js$/,
						use: ['source-map-loader'],
						enforce: 'pre',
					},
				],
			},

			// do not shim node globals like 'process', otherwise the result of
			// things like `process.cwd()` will be '/' instead of the actual
			// working directory.
			// TODO set this to 'false' only if a new user config option "node"
			// is set to true. We may have to see how this works once we upgrade
			// to native ESM when Electron supports that.
			node: false,
		},

		// The order of items in this array matters!
		files: [
			// Include the augment-node-path.js file first, which includes a
			// snippet of code that forces NODE_PATH to include the project's
			// node_modules folder even when karma-eletron in symlinked into the
			// project. See
			// https://github.com/twolfson/karma-electron/issues/44.
			path.resolve(__dirname, 'augment-node-path.js'),

			// Include all the test files *after* augment-node-path.js.
			{pattern: 'dist/**/*.test.js', watched: false},
		],

		// The augment-node-path.js file does not need to be included here,
		// because it imports only the built-in 'module' module, and otherwise
		// does not benefit from the electron or webpack preprocessors.
		preprocessors: {
			'dist/**/*.test.js': ['electron', 'webpack', 'sourcemap'],
		},

		client: debugMode
			? {}
			: {
					// Prevent a "require is not defined" error in
					// karma-electron
					useIframe: false,
					loadScriptsViaRequire: true,
			  },
	})
}
