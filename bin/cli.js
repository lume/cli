#!/usr/bin/env node

const program = require('caporal')
const {version} = require('../package.json')

program.version(version)

const {clean} = require('./gulpfile')
program.command('clean', 'Remove all build outputs.').action(clean)

const {build} = require('./gulpfile')
program.command('build', 'Build the project in which this command is being ran.').action(build)

const {dev} = require('./gulpfile')
program.command('dev', 'Run the project in watch mode where file changes trigger automatic rebuilds.').action(dev)

const {buildTs} = require('./gulpfile')
program.command('buildTs', 'Build only TypeScript sources.').action(buildTs)

const {buildJs} = require('./gulpfile')
program.command('buildJs', 'Build JavaScript files.').action(buildJs)

const {buildJsWatch} = require('./gulpfile')
program.command('buildJsWatch', 'Build JavaScript files in watch mode any time the files change.').action(buildJsWatch)

const {buildGlobal} = require('./gulpfile')
program
	.command('buildGlobal', 'Build the global version of the project for simple usage with browser script tags.')
	.action(buildGlobal)

const {buildGlobalWatch} = require('./gulpfile')
program
	.command('buildGlobalWatch', 'Build the global version of the project in watch mode any time files change.')
	.action(buildGlobalWatch)

const {showName} = require('./gulpfile')
program.command('showName', 'Output the project name to console.').action(showName)

const {typecheck} = require('./gulpfile')
program.command('typecheck', 'Run a typecheck of TypeScript source code without compiling output.').action(typecheck)

const {typecheckWatch} = require('./gulpfile')
program
	.command('typecheckWatch', 'Run a typecheck of TypeScript source code without compiling output, in watch mode.')
	.action(typecheckWatch)

const {test} = require('./gulpfile')
program.command('test', 'Run tests.').action(test)

const {testDebug} = require('./gulpfile')
program.command('testDebug', 'Run tests with GUI debugger.').action(testDebug)

const {releasePre} = require('./gulpfile')
program.command('releasePre', 'Run pre-release stuff like stashing changes and running tests.').action(releasePre)

const {releasePatch} = require('./gulpfile')
program
	.command('releasePatch', 'Release a patch version. Calls the same scripts as `npm version`.')
	.action(releasePatch)

const {releaseMinor} = require('./gulpfile')
program
	.command('releaseMinor', 'Release a minor version. Calls the same scripts as `npm version`.')
	.action(releaseMinor)

const {releaseMajor} = require('./gulpfile')
program
	.command('releaseMajor', 'Release a major version. Calls the same scripts as `npm version`.')
	.action(releaseMajor)

const {versionHook} = require('./gulpfile')
program
	.command(
		'versionHook',
		'This should be executed in a package.json "version" script which itself is automatically called by running `npm version` after the version number has been bumped. This is not intended for direct use.',
	)
	.action(versionHook)

const {postVersionHook} = require('./gulpfile')
program
	.command(
		'postVersionHook',
		'This is called automatically by the `npm version` command after a version has been committed and tagged. This is not intended for direct use.',
	)
	.action(postVersionHook)

const {prettier} = require('./gulpfile')
program.command('prettier', 'Format the code base with Prettier.').action(prettier)

const {prettierCheck} = require('./gulpfile')
program.command('prettierCheck', 'List which files would be formatted by Prettier.').action(prettierCheck)

async function main() {
	// await program.parseAsync(process.argv)
	await program.parse(process.argv)
}

main()

// Make sure the process exits with a non-zero exit code on unhandle promise
// rejections. This won't be necessary in an upcoming release of Node.js, in
// which case it'll exit non-zero automatically. Time of writing this comment:
// Node 13.8.
process.on('unhandledRejection', reason => {
	console.error(reason)
	process.exit(1)
})
