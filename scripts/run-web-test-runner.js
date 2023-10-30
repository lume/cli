// @ts-check
const path = require('path')
const {exec} = require('./exec.js')

main()

async function main() {
	const config = path.resolve(__dirname, '..', 'config', 'web-test-runner.config.mjs')
	const wtrBin = path.resolve(require.resolve('@web/test-runner'), '..', 'bin.js')
	const wtrCmd = `node ${wtrBin} --config ${config}`

	const opts = {
		env: {
			// NOTE_PATH: We set NODE_PATH to also include the node_modules of the current
			// working directory, in case that the CLI is symlinked into a project
			// (otherwise tooling may not be able to import those dependencies
			// because the upward search for node_modules will not include the
			// working directory of the project we are running in).
			NODE_PATH: `${process.cwd()}${path.sep}node_modules${path.delimiter}${process.env.NODE_PATH}`,
		},
	}

	console.log('--- Running tests with @web/test-runner ---')
	await exec(wtrCmd, opts)
}
