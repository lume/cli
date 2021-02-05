// @ts-check
const fs = require('fs')
const path = require('path')
const CWD = process.cwd()

let userConfigPath = path.join(CWD, 'lume.config.js')
let userConfigExists = fs.existsSync(userConfigPath)

if (!userConfigExists) {
	userConfigPath = path.join(CWD, 'lume.config.cjs')
	userConfigExists = fs.existsSync(userConfigPath)
}

/**
 * @type {{
 *   skipGlobal?: boolean
 *   globalName?: string | false
 *   globalEntrypoints?: string[]
 *   testWithAllTSAndBabelDecoratorBuildConfigurations?: boolean
 *   tsProjectReferenceMode?: boolean
 *   figletFont?: string
 * }}
 */
const userConfig = userConfigExists ? require(userConfigPath) : {}

module.exports = userConfig
