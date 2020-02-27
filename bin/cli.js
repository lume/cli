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

const {dev} = require('../config/gulpfile')
program
	.command('dev')
	.description('Run the project in watch mode where file changes trigger automatic rebuilds.')
	.action(dev)

const {buildTs} = require('../config/gulpfile')
program
	.command('buildTs')
	.description('Build only TypeScript sources.')
	.action(buildTs)

const {buildJs} = require('../config/gulpfile')
program
	.command('buildJs')
	.description('Build JavaScript files.')
	.action(buildJs)

const {buildJsWatch} = require('../config/gulpfile')
program
	.command('buildJsWatch')
	.description('Build JavaScript files in watch mode any time the files change.')
	.action(buildJsWatch)

const {buildGlobal} = require('../config/gulpfile')
program
	.command('buildGlobal')
	.description('Build the global version of the project for simple usage with browser script tags.')
	.action(buildGlobal)

const {buildGlobalWatch} = require('../config/gulpfile')
program
	.command('buildGlobalWatch')
	.description('Build the global version of the project in watch mode any time files change.')
	.action(buildGlobalWatch)

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

const {test} = require('../config/gulpfile')
program
	.command('test')
	.description('Run tests.')
	.action(test)

const {testDebug} = require('../config/gulpfile')
program
	.command('testDebug')
	.description('Run tests with GUI debugger.')
	.action(testDebug)

const {releasePre} = require('../config/gulpfile')
program
	.command('releasePre')
	.description('Run pre-release stuff like stashing changes and running tests.')
	.action(releasePre)

const {releasePatch} = require('../config/gulpfile')
program
	.command('releasePatch')
	.description('Release a patch version. Calls the same scripts as `npm version`.')
	.action(releasePatch)

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

const {versionHook} = require('../config/gulpfile')
program
	.command('versionHook')
	.description(
		'This should be executed in a package.json "version" script which itself is automatically called by running `npm version` after the version number has been bumped. This is not intended for direct use.',
	)
	.action(versionHook)

const {postVersionHook} = require('../config/gulpfile')
program
	.command('postVersionHook')
	.description(
		'This is called automatically by the `npm version` command after a version has been committed and tagged. This is not intended for direct use.',
	)
	.action(postVersionHook)

const {prettier} = require('../config/gulpfile')
program
	.command('prettier')
	.description('Format the code base with Prettier.')
	.action(prettier)

const {prettierList} = require('../config/gulpfile')
program
	.command('prettierList')
	.description('List which files would be formatted by Prettier.')
	.action(prettierList)

async function main() {
	await program.parseAsync(process.argv)
}

main()

// Make the process exit with a non-zero exit code on unhandle promise rejections.
process.on('unhandledRejection', reason => {
	console.error(reason)
	process.exit(1)
})
