const fs = require('fs')
const merge = require('lodash.merge')

const CWD = process.cwd()
const config = fs.existsSync(CWD+'/builder.config.js') ? require(CWD+'/builder.config.js') : {}
const buble = config.buble || {}

module.exports = merge({
    target: { ie: 10 },
    objectAssign: 'Object.assign',
    transforms: {
        modules: false,
        dangerousForOf: true,

        // Disable this to skip processing template strings with Buble and transpile
        // with another tool. Otherwise if we transpile them with Buble and we
        // need template tag functions, they won't work, tag functions are not
        // supported by Buble.
        templateString: true,
    },
}, buble)
