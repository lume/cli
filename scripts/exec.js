// @ts-check
const path = require('path')

/** @type {import('child_process').SpawnOptions | undefined} */
let execSpawnOptions

/**
 * An laternative to child_process.exec which is more like executing a shell
 * command (automatic env var inheritance, fail the parent program on error like
 * set -e, etc)
 *
 * @param {string} cmd - The command to run.
 * @param {{exitOnFail?: boolean, env?: {[k:string]: string}} | undefined} options - Options. If
 * .exitOnFail is not true (true is default), then the process that called
 * exec will exit if the spawned child process exits non-zero.
 */
exports.exec = async function exec(cmd, options = {}) {
	if (!execSpawnOptions) {
		execSpawnOptions = {
			shell: true,
			stdio: 'inherit',
			env: {
				...process.env,

				PATH: [
					// project node_modules
					path.resolve(process.cwd(), 'node_modules', '.bin'),
					// local node_modules wherever this package is installed
					path.resolve(__dirname, '..', 'node_modules', '.bin'),
					process.env.PATH,
				].join(path.delimiter),
			},
		}
	}

	const {exitOnFail = true, env = {}} = options

	let parts = cmd.trim().split(/\s+/)
	const bin = parts.shift()
	const {spawn} = require('child_process')

	await new Promise((resolve, reject) => {
		console.log('spawn command parts:', bin, ...parts)
		const child = spawn(bin, parts, {...execSpawnOptions, env: {...execSpawnOptions.env, ...env}})

		child.on('close', exitCode => {
			if (exitCode !== 0) {
				if (exitOnFail) process.exit(exitCode)
				else reject(exitCode)
				return
			}
			resolve()
		})

		process.on('exit', () => child.kill())
	})
}
