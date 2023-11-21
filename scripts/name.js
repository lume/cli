// outputs the name of the project to stdout using a cool multi-line ascii font. See:
// https://www.npmjs.com/package/figlet

const CWD = process.cwd()

const path = require('path')
const figlet = require('figlet')
const chalk = require('chalk')
const userConfig = require('../config/getUserConfig.js')

const pkg = require(path.resolve(CWD, 'package.json'))
let {name} = pkg

name = name || 'yet-to-be-named-project'

exports.showName = function showName() {
	return new Promise((resolve, _reject) => {
		figlet(name, {font: userConfig.figletFont || 'ICL-1900'}, function (err, data) {
			console.log(`\n\n${chalk.bold.blue(err ? ` --- ${name} --- ` : data)}\n\n\n\n`)
			resolve()
		})
	})
}

// if not called with require(), but directly with `node` (for backwards compatibility)
const executedDirectly = require.main === module
if (executedDirectly) {
	exports.showName()
}
