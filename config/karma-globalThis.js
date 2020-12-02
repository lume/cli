function getGlobal() {
	if (typeof globalThis !== 'undefined') return globalThis
	else if (typeof window !== 'undefined') return window
	else if (typeof global !== 'undefined') return global
	else return Function('return this')()
}

var globalThis = getGlobal()
