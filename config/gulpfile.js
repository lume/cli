// @ts-check
const {src, dest} = require('gulp')

// Copies assets from src/ to dist/, matching the same folder structure as in
// src/. An asset is considered to be any file other than source files. Source
// files end in .ts or .tsx.
exports.copyAssets = function () {
	return src([
		'./src/**',
		'!./src/**/*.{ts,tsx}',
		// Consider .d.ts files to be assets that need to be copied to dist/
		// XXX Should we make this configurable in lume.config.js?
		'./src/**/*.d.ts',
	]).pipe(dest('./dist/'))
}
