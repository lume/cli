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
 *   tsProjectReferenceMode?: boolean
 *   figletFont?: string
 *   useBabelForTypeScript?: boolean
 *   prettierIgnorePath?: string
 *   testFiles?: string | string[]
 *   importMap?: { imports: { [specifier: string]: string }, scopes: { [scope: string]: { [specifier: string]: string } } }
 * }} UserConfig
 */

/** @type {UserConfig} */
const userConfig = userConfigExists ? require(userConfigPath) : {}

module.exports = userConfig
