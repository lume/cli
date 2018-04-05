const CWD = process.cwd()
const path = require('path')

module.exports = {
    rootDir: CWD,
    transform: {
        '^.+\\.js$': path.resolve(__dirname, 'babel-jest'),
    },

    // a great environment that supports Custom Elements
    testEnvironment: '@skatejs/ssr/jest',
}
