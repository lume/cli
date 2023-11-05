// @ts-check
const fs = require('fs')
const path = require('path')
const CWD = process.cwd()
const cliBabelConfigPath = path.resolve(__dirname, 'babel.config.js')

let configPath = path.join(CWD, 'babel.config.js')
let configExists = fs.existsSync(configPath)

if (!configExists) {
	configPath = path.join(CWD, '.babelrc.js')
	configExists = fs.existsSync(configPath)
}

if (!configExists) {
	configPath = path.join(CWD, 'babel.config.json')
	configExists = fs.existsSync(configPath)
}

if (!configExists) {
	configPath = path.join(CWD, '.babelrc.json ')
	configExists = fs.existsSync(configPath)
}

if (!configExists) {
	configPath = cliBabelConfigPath
	configExists = true
}

module.exports = {configPath}
