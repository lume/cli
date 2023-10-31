// @ts-check
import {importMapsPlugin} from '@web/dev-server-import-maps'
import {playwrightLauncher} from '@web/test-runner-playwright'
import userConfig from './getUserConfig.js'

// path.resolve(process.cwd(), 'node_modules', 'jasmine-core', 'lib', 'jasmine-core', 'jasmine.js')

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
	files: 'dist/**/*.test.js',

	// For now, set this manually to true to enable watch mode.
	// TODO pass options like --watch from lume cli to web-test-runner.
	watch: process.env.WATCH_TESTS === 'true' ? true : false,

	// For now we limit concurrency until this is fixed: https://github.com/modernweb-dev/web/issues/2520
	concurrency: 1,

	// Run on random ports because we run test for multiple workspaces in
	// parallel.
	port: 3000 + Math.round(Math.random() * 5000),

	// Override the default Chrome launcher with Playwright launcher so to test
	// in all browsers in CI.
	browsers: process.env.CI
		? [playwrightLauncher({product: 'chromium'})]
		: // undefined defaults to Chrome (must be locally installed)
		  undefined,

	// We're using vanilla ES Modules, not automatic Node-based module
	// resolution, only import maps. Yeah baby! Embrace the platform!
	nodeResolve: false,
	plugins: [
		importMapsPlugin({
			inject: {
				importMap: {
					imports: {
						sinon: '/node_modules/@lume/cli/node_modules/sinon/pkg/sinon-esm.js',
						...(userConfig.importMap?.imports ?? {}),
					},
					scopes: {
						...(userConfig.importMap?.scopes ?? {}),
					},
				},
			},
		}),
	],

	testRunnerHtml: testFramework => /*html*/ `
		<html>
			<body>
				<!--
				Install Jest API globally (namely for the expect() API).
				TODO: type defs specifically for expect() without bringing all type defs of all Jest globals. Right now Lume packages declare it with an any args type and any return type.
				-->
				<script src="/node_modules/@lume/cli/node_modules/jest-browser-globals/build-es5/index.js"></script>

				<script>
					// Polyfill some Jasmine/Jest APIs using web-test-runner's
					// default Mocha APIs. The reason for this is to avoid
					// having to port all our existing tests from when we used
					// Karma with Jasmine before @web/test-runner.
					// TODO type defs
					Object.defineProperties(globalThis, {
						beforeAll: {
							get() {
								return globalThis.before
							}
						},
						afterAll: {
							get() {
								return globalThis.after
							}
						}
					})
				</script>

				<script type="module" src="${testFramework}"></script>
			</body>
		</html>
	`,
}
