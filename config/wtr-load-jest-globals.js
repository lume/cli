const jestGlobals = '/node_modules/@lume/cli/node_modules/jest-browser-globals/build-es5/index.js'
const r = new XMLHttpRequest()
r.open('GET', jestGlobals, /*asynchronous:*/ false)
r.send()

const itExists = r.status === 200

if (itExists) {
	console.log('hmmmmmm')
	document.write(/*html*/ `<script src="${jestGlobals}"></script>`)
} else {
	console.log('huuuuuuuuh')
	// Otherwise it is hoisted.
	document.write(/*html*/ `<script src="${jestGlobals.replace('/node_modules/@lume/cli', '')}"></script>`)
}
