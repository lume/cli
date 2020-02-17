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

async function main() {
	await program.parseAsync(process.argv)
}

main()

// Make the process exit with a non-zero exit code on unhandle promise rejections.
process.on('unhandledRejection', reason => {
	console.error(reason)
	process.exit(1)
})
