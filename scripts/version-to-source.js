#!/usr/bin/env node

// TODO instead of writing to the last line of the index file, write to a single
// file (if present) that exports only the version number.

const CWD = process.cwd()

const fs = require('fs')
const path = require('path')
const version = require(path.resolve(CWD, 'package.json')).version

let data = null
let filePath = null
filePath = path.resolve(CWD, 'src', 'index.js')

try {
	data = fs.readFileSync(filePath).toString()
} catch (e) {
	try {
		filePath = path.resolve(CWD, 'src', 'index.ts')
		data = fs.readFileSync(filePath).toString()
	} catch (e) {}
}

if (!data) {
	console.error(
		'No JavaScript or TypeScript index file found, or unable to read the file. Skipping update of version number in index file.',
	)
	process.exit()
}

const lines = data.trim().split('\n')

// TODO this is fragile. Prefer to modify a version.ts file instead that the user can explicitly put in the project to opt in.
lines.pop() // delete last line

lines.push(`export const version = '${version}'`)

data = lines.join('\n') + '\n'

fs.writeFileSync(filePath, data)
