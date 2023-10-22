// @ts-check
const path = require('path')
const {exec} = require('./exec.js')

main()

async function main() {
	// xvfb-maybe: If we don't have a graphical display, xvfb-maybe will set up an
	// X11 emulator, and set the DISPLAY env var for electron so it can run
	// "headless". (NOTE, We're no longer using Electron, and we will replace Karma
	// with @web/test-runner, but this still works as-is for now)
	const karmaCommand = `xvfb-maybe karma start ${path.resolve(__dirname, '..', 'config', 'karma.config.js')}`

	const opts = {
		env: {
			// NOTE_PATH: We set NODE_PATH to also include the node_modules of the current
			// working directory, in case that the CLI is symlinked into a project
			// (otherwise Karma or other tooling may not be able to import those
			// dependencies because the upward search for node_modules will not include the
			// working directory of the project we are running in).
			NODE_PATH: `${process.cwd()}${path.sep}node_modules${path.delimiter}${process.env.NODE_PATH}`,

			ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
		},
	}

	console.log(
		'--- Running regular tests (dist/**/*.test.js files but not dist/global.test.js or dist/global/*.test.js files) ---',
	)
	await exec(karmaCommand, opts)

	// TODO remove global build and global tests
	console.log('--- Running tests for global build (dist/global.test.js and dist/global/*.test.js files) ---')
	await exec(karmaCommand, {...opts, env: {...opts.env, TEST_GLOBALS: 'true'}})
}
