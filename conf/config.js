let env

if (process.env.CI) {
    env = `CI`
}

let config

let postfix = '';

switch (process.env.BRANCH) {
    case 'stage1':
        postfix = '-stage1';
        break;
    case 'stage2':
        postfix = '-stage2';
        break;
    default:
        postfix = '';
}

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
    auth0: {
        client_id: '',
        client_secret: '',
        url: 'https://dev-npouz6tu.auth0.com',
        redirect_uri: 'https://am-ssoauth.surge.systems'
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
        sflAdmin: {
            successLogin: 'https://sfl-admin.surge.systems/#/successLogin/',
            errorLogin: 'https://sfl-admin.surge.systems/#/errorLogin/',
            expiresIn: '8h'
        },
        backoffice: {
            successLogin: `https://backoffice${postfix}.surge.systems/successLogin/`,
            errorLogin: `https://backoffice${postfix}.surge.systems/errorLogin/`,
            expiresIn: '8h'
        },
        backofficestage2: {
            successLogin: `https://backoffice-stage2.surge.systems/successLogin/`,
            errorLogin: `https://backoffice-stage2.surge.systems/errorLogin/`,
            expiresIn: '8h'
        },
        umbrella: {
            successLogin: `https://umbrella${postfix}.surge.systems/successLogin/`,
            errorLogin: `https://umbrella${postfix}.surge.systems/errorLogin/`,
            expiresIn: '8h'
        },
        paymentsTool: {
            successLogin: `https://payments-tool${postfix}.surge.systems/successLogin/`,
            errorLogin: `https://payments-tool${postfix}.surge.systems/errorLogin/`,
            expiresIn: '8h'
        },
        adminLegacy: {
            successLogin: 'https://admin.ad-center.com/front/auth_success/',
            errorLogin: 'https://admin.ad-center.com/front/auth_error/',
            expiresIn: '8h'
        },
        clientId: '',
        clientSecret: ''
    },
    whiteList: {
        emails: [
            'eric@ad-center.com',
            'eric.pedersen@ad-center.com',
            'jeffrey@ad-center.com',
            'jeffrey.tayoto@adsurge.com',
            'jeffrey.tayoto@ad-center.com',
            'artem.makarov@actionmediamtl.com',
            'maxim.litvinchik@milkbox.com',
            'nathan.parris@joventures.com',
            'dmytro.miroshnykov@actionmediamtl.com',
            'miroshnykov@gmail.com'
        ],
        domains: [
            'actionmediamtl.com',
            'grindstonecapital.ca',
            'hyuna.bb',
            'ad-center.com',
            'milkbox.com'
        ]
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
