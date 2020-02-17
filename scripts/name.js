// outputs the name of the project to stdout using a cool multi-line ascii font. See:
// https://www.npmjs.com/package/figlet

const CWD = process.cwd()

const path = require('path')
const figlet = require('figlet')

const pkg = require(path.resolve(CWD, 'package.json'))
let {name} = pkg

name = name || 'yet-to-be-named-project'

exports.showName = async function showName() {
	return new Promise((resolve, _reject) => {
		figlet(
			name,
			{
				// TODO configurable
				font: 'Calvin S',
			},
			function(err, data) {
				if (err) {
					console.log(` --- ${name} --- `)
					resolve()
					return
				}

				console.log(data)
				console.log('')
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
