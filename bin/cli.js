#!/usr/bin/env node
// @ts-check

const commander = require('commander')
const commands = require('./commands')
const {version} = require('../package.json')

const cli = new commander.Command()

// globalThis.cli = cli

cli.version(version, '-v, --version')
cli.helpOption('-h, --help')

cli.option('-V, --verbose', 'Show verbose output.')

cli.option('--noFail', 'Prevent build commands from failing on non-zero exit codes.', false)

cli.command('clean').description('Remove all build outputs.').action(commands.clean)

cli.command('build').description('Build the project in which this command is being ran.').action(commands.build)

cli
	.command('dev')
	.description('Run the project in watch mode where file changes trigger automatic rebuilds.')
	.action(commands.dev)

cli
	.command('copyAssets')
	.description('Copy any assets from src/ into dist/, mirroring the same folder structure in dist/ as in src/.')
	.action(commands.copyAssets)

cli
	.command('buildTs')
	.description('Build only TypeScript sources.')
	.action(async () => {
		await commands.buildTs()
	})

cli.command('showName').description('Output the project name to console.').action(commands.showName)

cli
	.command('typecheck')
	.description('Run a typecheck of TypeScript source code without compiling output.')
	.action(commands.typecheck)

cli
	.command('typecheckWatch')
	.description('Run a typecheck of TypeScript source code without compiling output, in watch mode.')
	.action(commands.typecheckWatch)

cli.command('test').description('Run tests.').action(commands.test)

cli.command('testDebug').description('Run tests with GUI debugger.').action(commands.testDebug)

cli
	.command('releasePre')
	.description('Run pre-release stuff like stashing changes and running tests.')
	.action(commands.releasePre)

cli
	.command('releasePatch')
	.description('Release a patch version. Calls the same scripts as `npm version`.')
	.action(commands.releasePatch)

cli
	.command('releaseMinor')
	.description('Release a minor version. Calls the same scripts as `npm version`.')
	.action(commands.releaseMinor)

cli
	.command('releaseMajor')
	.description('Release a major version. Calls the same scripts as `npm version`.')
	.action(commands.releaseMajor)

cli
	.command('releaseAlphaMajor')
	.description('Release an alpha major version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseAlphaMajor)

cli
	.command('releaseAlphaMinor')
	.description('Release an alpha minor version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseAlphaMinor)

cli
	.command('releaseAlphaPatch')
	.description('Release an alpha patch version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseAlphaPatch)

cli
	.command('releaseBetaMajor')
	.description('Release a beta major version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseBetaMajor)

cli
	.command('releaseBetaMinor')
	.description('Release a beta minor version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseBetaMinor)

cli
	.command('releaseBetaPatch')
	.description('Release a beta patch version. Calls the same npm hooks as `npm version`.')
	.action(commands.releaseBetaPatch)

cli
	.command('releaseAlpha')
	.description(
		'Release an alpha pre-release version bump, f.e. v1.2.3-alpha.1 to v1.2.3-alpha.2. Calls the same npm hooks as `npm version`.',
	)
	.action(commands.releaseAlpha)

cli
	.command('releaseBeta')
	.description(
		'Release a beta pre-release version bump, f.e. v1.2.3-beta.1 to v1.2.3-beta.2. Calls the same npm hooks as `npm version`.',
	)
	.action(commands.releaseBeta)

cli
	.command('versionHook')
	.description('Your package.json "version" script should run this. Used by "npm version".')
	.action(commands.versionHook)

cli
	.command('postVersionHook')
	.description('Your package.json "postversion" script should run this. Used by "npm version".')
	.action(commands.postVersionHook)

cli.command('prettier').description('Format the code base with Prettier.').action(commands.prettier)

cli
	.command('prettierCheck')
	.description('List which files would be formatted by Prettier. Exits non-zero if files need to be formatted.')
	.action(commands.prettierCheck)

// Make sure the process exits with a non-zero exit code on unhandle promise
// rejections. This won't be necessary in an upcoming release of Node.js, in
// which case it'll exit non-zero automatically. Time of writing this comment:
// Node 13.8.
process.on('unhandledRejection', reason => {
	console.error(reason)
	process.exit(1)
})

// Explicitly handle SIGINT (ctrl+c), because for some strange reason, if this
// script is wrapped in two layers of npm scripts in package.json, then it
// will randomly exit 0 or 130 instead of always exiting with a 130 code.
// See: https://github.com/npm/cli/issues/1072
process.on('SIGINT', () => {
	console.log('\nInterrupted. Exiting.\n')
	process.exit(130) // 130 is the standard exit code for interruptions.
})

async function main() {
	commands.setCli(cli)
	commands.setOpts(cli.opts())

	// runs command(s)
	cli.parse()
}

main()
