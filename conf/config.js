let env

if (process.env.CI) {
    env = `CI`
}

let config

config = {
    env: process.env.NODE_ENV || env || `production`,
    host: '0.0.0.0',
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
            successLogin: 'https://optiai-platform1.surge.systems/successLogin/',
            errorLogin: 'https://optiai-platform1.surge.systems/errorLogin/'
        },
        sfl: {
            successLogin: 'https://sfl-advertiser.surge.systems/#/successLogin/',
            errorLogin: 'https://sfl-advertiser.surge.systems/#/errorLogin/'
        },
        clientId: '',
        clientSecret: ''
    }
}

module.exports = config
