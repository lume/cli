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
 * @typedef {{
 *   testWithAllTSAndBabelDecoratorBuildConfigurations?: boolean
 *   tsProjectReferenceMode?: boolean
 *   figletFont?: string
 *   prettierIgnorePath?: string
 *   importMap?: { imports: { [specifier: string]: string }, scopes: { [scope: string]: { [specifier: string]: string } } }
 * }} UserConfig
 */

/** @type {UserConfig} */
const userConfig = userConfigExists ? require(userConfigPath) : {}

module.exports = userConfig
