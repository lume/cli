#!/usr/bin/env node

const cli = require('sywac')
const commands = require('./commands')

let c
function chalk() {
	// lazily load chalk, only used if help text displayed
	if (!c) c = require('chalk')
	return c
}

cli.version('-v, --version')
cli.help('-h, --help')

const {clean} = commands
cli.command('clean', {desc: 'Remove all build outputs.', run: clean})

const {build} = commands
cli.command('build', {desc: 'Build the project in which this command is being ran.', run: build})

const {dev} = commands
cli.command('dev', {desc: 'Run the project in watch mode where file changes trigger automatic rebuilds.', run: dev})

const {buildTs} = commands
cli.command('buildTs', {desc: 'Build only TypeScript sources.', run: buildTs})

const {buildJs} = commands
cli.command('buildJs', {desc: 'Build JavaScript files.', run: buildJs})

const {buildJsWatch} = commands
cli.command('buildJsWatch', {
	desc: 'Build JavaScript files in watch mode any time the files change.',
	run: buildJsWatch,
})

const {buildGlobal} = commands
cli.command('buildGlobal', {
	desc: 'Build the global version of the project for simple usage with browser script tags.',
	run: buildGlobal,
})

const {buildGlobalWatch} = commands
cli.command('buildGlobalWatch', {
	desc: 'Build the global version of the project in watch mode any time files change.',
	run: buildGlobalWatch,
})

const {showName} = commands
cli.command('showName', {dec: 'Output the project name to console.', run: showName})

const {typecheck} = commands
cli.command('typecheck', {
	desc: 'Run a typecheck of TypeScript source code without compiling output.',
	run: typecheck,
})

const {typecheckWatch} = commands
cli.command('typecheckWatch', {
	desc: 'Run a typecheck of TypeScript source code without compiling output, in watch mode.',
	run: typecheckWatch,
})

const {test} = commands
cli.command('test', {desc: 'Run tests.', run: test})

const {testDebug} = commands
cli.command('testDebug', {desc: 'Run tests with GUI debugger.', run: testDebug})

const {releasePre} = commands
cli.command('releasePre', {desc: 'Run pre-release stuff like stashing changes and running tests.', run: releasePre})

const {releasePatch} = commands
cli.command('releasePatch', {
	desc: 'Release a patch version. Calls the same scripts as `npm version`.',
	run: releasePatch,
})

const {releaseMinor} = commands
cli.command('releaseMinor', {
	desc: 'Release a minor version. Calls the same scripts as `npm version`.',
	run: releaseMinor,
})

const {releaseMajor} = commands
cli.command('releaseMajor', {
	desc: 'Release a major version. Calls the same scripts as `npm version`.',
	run: releaseMajor,
})

const {versionHook} = commands
cli.command('versionHook', {
	desc: 'Your package.json "version" script should run this. Used by "npm version".',
	run: versionHook,
})

const {postVersionHook} = commands
cli.command('postVersionHook', {
	desc: 'Your package.json "postversion" script should run this. Used by "npm version".',
	run: postVersionHook,
})

const {prettier} = commands
cli.command('prettier', {desc: 'Format the code base with Prettier.', run: prettier})

const {prettierCheck} = commands
cli.command('prettierCheck', {desc: 'List which files would be formatted by Prettier.', run: prettierCheck})

// General example os Sywac with colored help text: https://github.com/sywac/sywac/issues/46
cli.style({
	usagePrefix: str => chalk().yellow(str.slice(0, 6)) + ' ' + chalk().bold(str.slice(7)),
	usageCommandPlaceholder: str => chalk().bold(str),
	usagePositionals: str => chalk().bold(str),
	usageArgsPlaceholder: str => chalk().bold(str),
	usageOptionsPlaceholder: str => chalk().bold(str),
	group: str => chalk().yellow(str),
	flags: str => chalk().bold(str),
	desc: str => chalk().cyan(str),
	hints: str => chalk().gray.dim(str),
	groupError: str => chalk().red.bold(str),
	flagsError: str => chalk().red.bold(str),
	descError: str => chalk().red.bold(str),
	hintsError: str => chalk().red(str),
	messages: str => chalk().red.bold(str), // these are error messages
})

// display help unless a command with "run" method is called
cli.showHelpByDefault()

async function main() {
	// await cli.parse(process.argv)
	await cli.parseAndExit()
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
