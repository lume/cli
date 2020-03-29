// outputs the name of the project to stdout using a cool multi-line ascii font. See:
// https://www.npmjs.com/package/figlet

const CWD = process.cwd()

const path = require('path')
const figlet = require('figlet')
const chalk = require('chalk')

const pkg = require(path.resolve(CWD, 'package.json'))
let {name} = pkg

name = name || 'yet-to-be-named-project'

exports.showName = async function showName() {
	return new Promise((resolve, _reject) => {
		figlet(
			name,
			{
				// TODO make this configurable
				// font: 'Calvin S',
				// font: 'Big',
				// font: 'Small',
				// font: 'Small Slant',
				// font: 'Graffiti',
				// font: 'ANSI Shadow',
				font: 'Bigfig',
				// font: 'Mini',
				// font: 'Rounded',
				// font: 'Script',
				// font: 'Shimrod',
				// font: 'Short',
				// font: 'Thin',
				// font: 'Three Point',
			},
			function(err, data) {
				if (err) {
					console.log(chalk.bold.blue(` --- ${name} --- `))
					resolve()
					return
				}

				console.log(`\n\n${chalk.bold.blue(data)}\n\n\n\n`)
				resolve()
			},
		)
	})
}

// if not called with require(), but directly with `node` (for backwards compatibility)
const executedDirectly = require.main === module
if (executedDirectly) {
	exports.showName()
}
