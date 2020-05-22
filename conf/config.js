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
    pcapi: {
        host: '"http://localhost:4002/"'
    },
    aws: {
        key: '',
        access_key: '',
        region: '',
        queueUrl: ''
    },
    googleAuth: {
        oauthCallback: '',
        redirectToOptiPlatformsuccesslogin: '',
        redirectToOptiPlatformerrorlogin: '',
        redirectToOptiPlatformsuccess: '',
        clientId: '',
        clientSecret: ''
    },
    moneyBadger: {
        url: '',
        secret: ''
    }
    // moneyBadgerUrl:'http://moneybadger01.infra.systems:8822'
}

module.exports = config
