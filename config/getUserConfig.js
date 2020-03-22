// @ts-check
const fs = require('fs')
const path = require('path')
const CWD = process.cwd()

let builderConfigPath = path.join(CWD, 'lume.config.js')
let builderConfigExists = fs.existsSync(builderConfigPath)

if (!builderConfigExists) {
	builderConfigPath = path.join(CWD, 'lume.config.cjs')
	builderConfigExists = fs.existsSync(builderConfigPath)
}

const builderConfig = builderConfigExists ? require(builderConfigPath) : {}

module.exports = builderConfig
