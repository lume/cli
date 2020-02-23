#!/usr/bin/env node

const {Command} = require('commander')
const {version} = require('../package.json')

const program = new Command()

program.version(version)

const {clean} = require('../config/gulpfile')
program
	.command('clean')
	.description('Remove all build outputs.')
	.action(clean)

const {build} = require('../config/gulpfile')
program
	.command('build')
	.description('Build the project in which this command is being ran.')
	.action(build)

const {buildTs} = require('../config/gulpfile')
program
	.command('buildTs')
	.description('Build only TypeScript sources.')
	.action(buildTs)

const {buildGlobal} = require('../config/gulpfile')
program
	.command('buildGlobal')
	.description('Build the global version of the project for simple usage with browser script tags.')
	.action(buildGlobal)

const {dev} = require('../config/gulpfile')
program
	.command('dev')
	.description('Run the project in watch mode where file changes trigger automatic rebuilds.')
	.action(dev)

const {showName} = require('../config/gulpfile')
program
	.command('showName')
	.description('Output the project name to console.')
	.action(showName)

const {typecheck} = require('../config/gulpfile')
program
	.command('typecheck')
	.description('Run a typecheck of TypeScript source code without compiling output.')
	.action(typecheck)

const {typecheckWatch} = require('../config/gulpfile')
program
	.command('typecheckWatch')
	.description('Run a typecheck of TypeScript source code without compiling output, in watch mode.')
	.action(typecheckWatch)

const {releasePre} = require('../config/gulpfile')
program
	.command('releasePre')
	.description('Run pre-release stuff like stashing changes and running tests.')
	.action(releasePre)

const {releaseMinor} = require('../config/gulpfile')
program
	.command('releaseMinor')
	.description('Release a minor version. Calls the same scripts as `npm version`.')
	.action(releaseMinor)

const {releaseMajor} = require('../config/gulpfile')
program
	.command('releaseMajor')
	.description('Release a major version. Calls the same scripts as `npm version`.')
	.action(releaseMajor)

const {releasePatch} = require('../config/gulpfile')
program
	.command('releasePatch')
	.description('Release a patch version. Calls the same scripts as `npm version`.')
	.action(releasePatch)

async function main() {
	await program.parseAsync(process.argv)
}

main()

// Make the process exit with a non-zero exit code on unhandle promise rejections.
process.on('unhandledRejection', reason => {
	console.error(reason)
	process.exit(1)
})
