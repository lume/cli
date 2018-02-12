// empty export, so that `require.resolve('ARCHETYPE')` from the application
// (in f.e. in config/webpack.config.js) will work, otherwise `require` can't
// find this ARCHETYPE location.
module.exports = {}
