#!/usr/bin/env node

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
	console.error('No index file found, or unable to read index file. Skipping version update in index file.')
	return
}

process.exit()

const lines = data.trim().split('\n')
lines.pop() // delete last line

lines.push(`export const version = '${version}'`)

data = lines.join('\n') + '\n'

fs.writeFileSync(filePath, data)
