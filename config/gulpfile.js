// @ts-check
const {src, dest} = require('gulp')

// Copies assets from src/ to dist/, matching the same folder structure as in
// src/. An asset is considered to be any file other than source files. Source
// files end in .ts or .tsx.
exports.copyAssets = function () {
	return src(['./src/**', '!./src/**/*.{ts,tsx}']).pipe(dest('./dist/'))
}
