const CWD = process.cwd()
const path = require('path')

module.exports = {
    rootDir: CWD,
    transform: {
        '^.+\\.js$': path.resolve(__dirname, 'babel-jest'),
    },
}
