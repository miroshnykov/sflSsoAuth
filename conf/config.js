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
            successLogin: 'https://pcapi.surge.systems/#/successLogin/',
            errorLogin: 'https://pcapi.surge.systems/#/errorLogin/'
        },
        opti: {
            successLogin: 'https://optiai-platform1.surge.systems/successLogin/',
            errorLogin: 'https://optiai-platform1.surge.systems/errorLogin/'
        },
        sfl: {
            successLogin: 'https://sfl-advertiser.surge.systems/#/successLogin/',
            errorLogin: 'https://sfl-advertiser.surge.systems/#/errorLogin/'
        },
        cap: {
            successLogin: 'https://cap-ui.surge.systems/#/successLogin/',
            errorLogin: 'https://cap-ui.surge.systems/#/errorLogin/'
        },
        backoffice: {
            successLogin: 'https://backoffice.surge.systems/successLogin/',
            errorLogin: 'https://backoffice.surge.systems/errorLogin/',
            expiresIn: '8h'
        },
        clientId: '',
        clientSecret: ''
    },
    whiteList: {
        emails: ['eric@ad-center.com', 'eric.pedersen@ad-center.com','jeffrey@ad-center.com', 'jeffrey.tayoto@adsurge.com','jeffrey.tayoto@ad-center.com','artem.makarov@actionmediamtl.com', 'miroshnykov@gmail.com','nathan.parris@joventures.com'],
        domains: ['actionmediamtl.com', 'grindstonecapital.ca', 'hyuna.bb', 'ad-center.com']
    },
    influxdb: {
        host: 'https://influx.surge.systems/influxdb',
        project: 'ssoAuth',
        intervalRequest: 10, // batch post to influxdb when queue length gte 100
        intervalSystem: 30000, // 30000 ms = 30 s
        intervalDisk: 60000 // 300000 ms = 5 min
    }
}
module.exports = config