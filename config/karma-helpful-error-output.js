// const {remote} = require('electron')

window.addEventListener('error', err => {
	console.log(err)
	// remote.getGlobal('console').log(err)
})

// process.on('uncaughtException', err => {
// 	console.log(err)
// 	remote.getGlobal('global').console.log(err)
// })

// remote.getGlobal('global').process.on('uncaughtException', err => {
// 	console.log(err)
// 	remote.getGlobal('global').console.log(err)
// })
