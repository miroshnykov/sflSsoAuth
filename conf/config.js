let env

if (process.env.CI) {
    env = `CI`
}

let config

config = {
    env: process.env.NODE_ENV || env || `production`,
    host: 'localhost',
    port: 9080,
    jwt_secret: '',
    mysql: {
        host: '',
        port: 0,
        user: '',
        password: '',
        database: ''
    },
    googleAuth: {
        oauthCallback: '',
        pcapi: {
            successLogin: '',
            errorLogin: ''
        },
        opti: {
            successLogin: '',
            errorLogin: ''
        },
        sfl: {
            successLogin: '',
            errorLogin: ''
        },
        clientId: '',
        clientSecret: ''
    }
}

module.exports = config
