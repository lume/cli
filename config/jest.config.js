const CWD = process.cwd()
const path = require('path')
const fs = require('fs')
const merge = require('webpack-merge')

let config = {
    rootDir: CWD,

    testMatch: [
        '**/__tests__/**/*.js?(x)',
        '**/?(*.)(spec|test).js?(x)',
    ],

    transform: {
        '^.+\\.js$': path.resolve(__dirname, 'babel-jest'),
    },

    testPathIgnorePatterns: [
        'node_modules',
    ],

    // a great environment that supports Custom Elements
    testEnvironment: '@skatejs/ssr/jest',
}

const userConfigPath = path.resolve( CWD, 'jest.config.js' )
let userConfig = null

if ( fs.existsSync( userConfigPath ) ) {
    userConfig = require( userConfigPath )
}

if (userConfig) config = merge(config, userConfig)

module.exports = config
