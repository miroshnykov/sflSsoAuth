const path = require('path')
const express = require('express')
const cors = require('cors')
const DIST_DIR = path.join(__dirname, '.')
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const parser = require('ua-parser-js')

const {google} = require('googleapis')
let oAuth2 = google.auth.OAuth2
const config = require('plain-config')()
const clientId = config.googleAuth.clientId
const clientSecret = config.googleAuth.clientSecret
const oauthCallback = config.googleAuth.oauthCallback
const {
    getUser,
    setUser,
    getUserAuth0,
    setUserAuth,
    getUserPermissions,
    getUserRole
} = require('./db/user')

const axios = require('axios')

const {v4} = require('uuid')
const base64 = require('base-64')
const utf8 = require('utf8')
const metrics = require('./metrics')

const PORT = config.port
const HOST = config.host

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

const getOAuthClient = () => (new oAuth2(clientId, clientSecret, oauthCallback))

const getAuthUrl = (projectName, appKey) => {
    let oauth2Client = getOAuthClient()
    let scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ]

    const state = {
        project: projectName
    };
    if (appKey) {
        state.app_key = appKey;
    }

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify(state),
    })

}

const getTokenSaveSession = async (code, state, res) => {
    let oauth2Client = getOAuthClient()
    return oauth2Client.getToken(code, (err, tokens) => {

        let projectInfo = JSON.parse(state)

        let successLogin = config.googleAuth[projectInfo.project].successLogin
        let errorLogin = config.googleAuth[projectInfo.project].errorLogin

        console.log(` Project { ${projectInfo.project} }. successLogin:${successLogin} , errorLogin:${errorLogin}`)

        if (!successLogin) {
            console.log('  THERE IS NO REDIRECT URL, the project does not define  correctly ')
            return
        }

        if (!err) {
            oauth2Client.setCredentials(tokens)
            let sessionId = v4()
            getUserInfo(tokens).then(async (info) => {
                try {
                    const userPermissions = await getUserPermissions(info.employee_id, projectInfo.app_key);
                    // @todo remove check for domain end emails after adding permissions and logs
                    console.log(`permissions for user ${info.employee_id} and project ${projectInfo.project}`);
                    console.log(userPermissions);
                    if ((projectInfo.project !== 'umbrella' && config.whiteList.domains.includes(info.hd)) ||
                        (projectInfo.project !== 'umbrella' && config.whiteList.emails.includes(info.email)) ||
                        userPermissions.includes('login')
                        || (info.is_admin && projectInfo.project === 'umbrella')
                    ) {
                        const project = projectInfo.project;
                        console.log(`login with project-${project}`)
                        const expiresIn = (project && config.googleAuth[project] && config.googleAuth[project].expiresIn)
                            ? config.googleAuth[project].expiresIn
                            : '1h';

                        let token = jwt.sign({email: info.email, id: sessionId}, config.jwt_secret, {expiresIn})

                        let bytes = utf8.encode(token);
                        let encoded = base64.encode(bytes);

                        res.redirect(`${successLogin}${encoded}`)
                    } else {
                        let emailToSend = info.email.split('.').join("")
                        console.log(`Wrong domaine name ${emailToSend}`)
                        res.redirect(`${errorLogin}${emailToSend}`)
                    }
                } catch (error) {
                    console.error('err:', error)
                    res.redirect(`${errorLogin}/error`)
                }
            })

        } else {
            console.error('err:', err)
            res.redirect(`${errorLogin}/error`)
        }
    })
}

const aut0RedirectToProject = async (code, state, res) => {

    let projectInfo = JSON.parse(state)
    console.log('projectName:', projectInfo.project)
    let successLogin = config.googleAuth[projectInfo.project].successLogin
    let errorLogin = config.googleAuth[projectInfo.project].errorLogin

    console.log(` Project { ${projectInfo.project} }. successLogin:${successLogin} , errorLogin:${errorLogin}`)
    try {

        let tokenParams = {
            client_id: config.auth0.client_id,
            client_secret: config.auth0.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: `${config.auth0.redirect_uri}/auth0Callback`,
        }

        let getTokenPostData = {
            method: 'post',
            url: `${config.auth0.url}/oauth/token`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(tokenParams)
        };

        let {data} = await axios(getTokenPostData);

        let paramsUserInfo = {
            method: 'get',
            url: `${config.auth0.url}/userinfo`,
            headers: {
                'Authorization': `Bearer ${data.access_token}`,
            }
        };

        // console.log('paramsUserInfo:', paramsUserInfo)
        let userInfo = await axios(paramsUserInfo);

        await setUserAuth(userInfo.data)
        let userInfoData = await getUserAuth0(userInfo.data.email)
        console.log('userInfoData:', userInfoData)

        let userEmail = userInfoData[0].email
        let employeeId = userInfoData[0].employee_id
        let isAdmin = userInfoData[0].is_admin
        if (!successLogin) {
            console.log('  THERE IS NO REDIRECT URL, the project does not define  correctly ')
            return
        }
        let sessionId = v4()

        let userPermissions = await getUserPermissions(employeeId, projectInfo.app_key);
        console.log(`permissions for user ${employeeId} and project ${projectInfo.projectName}`);
        console.log(userPermissions);
        const domain = userEmail.substring(userEmail.lastIndexOf("@") + 1);

        if (
            (projectInfo.project !== 'umbrella' && config.whiteList.emails.includes(userEmail))
            || (projectInfo.project !== 'umbrella' && config.whiteList.domains.includes(domain))
            || userPermissions.includes('login')
            || (isAdmin && projectInfo.project === 'umbrella')
        ) {
            console.log(`login with project-${projectInfo.project}`)
            const expiresIn = (projectInfo.project && config.googleAuth[projectInfo.project] && config.googleAuth[projectInfo.project].expiresIn)
                ? config.googleAuth[projectInfo.project].expiresIn
                : '1h';

            let token = jwt.sign({email: userEmail, id: sessionId}, config.jwt_secret, {expiresIn})

            let bytes = utf8.encode(token);
            let encoded = base64.encode(bytes);

            res.redirect(`${successLogin}${encoded}`)
        } else {
            let emailToSend = userEmail.split('.').join("")
            console.log(` AUTH0 Wrong domain name ${emailToSend}`)
            res.redirect(`${errorLogin}${emailToSend}`)
        }

    } catch (e) {
        console.error('err:', e)
        res.redirect(`${errorLogin}/error`)
    }
}

const getUserInfo = async (tokens) => {
    let oauth2Client = await getOAuthClient()
    oauth2Client.setCredentials(tokens)

    let oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
    })

    let info = await oauth2.userinfo.v2.me.get()

    await setUser(info.data)

    const user = await getUserByEmail(info.data.email);

    info.data.employee_id = user.employee_id;
    info.data.is_admin = user.is_admin;

    return info.data
}

const getUserByEmail = async (email) => {

    const userArray = await getUser(email);
    if (!userArray || !userArray[0]) {
        return;
    }
    return userArray[0];
};

app.get('/health', (req, res, next) => {
    res.send('Ok')
})

// app.get('/loginUrl', (req, res) => {
//     const appKey = req.headers['am-app-key'];
//     let url = getAuthUrl(req.query.projectName, appKey)
//     res.json(url)
// })

app.get('/loginUrl', (req, res) => {
    const appKey = req.headers['am-app-key'];
    const state = {
        project: req.query.projectName
    };
    if (appKey) {
        state.app_key = appKey;
    }
    let connection = config.env === 'staging' || config.env === 'staging2' ? 'stage1' : config.env
    // console.log('connection:', connection)
    let url = `${config.auth0.url}/authorize?response_type=code&scope=openid profile email&client_id=${config.auth0.client_id}&connection=${connection}&redirect_uri=${config.auth0.redirect_uri}/auth0Callback&state=${JSON.stringify(state)}`
    console.log(url)
    res.json(url)
})
app.get('/verifyToken', (req, res) => {
    let response
    try {
        console.log('verifyToken:', req.query.token)
        let tokenInfo = jwt.verify(req.query.token, config.jwt_secret)
        console.log('tokenInfo:', tokenInfo)

        if (tokenInfo && tokenInfo.email) {
            console.log('\ntokenInfoEmail:', tokenInfo.email)
            response = tokenInfo.email
        }
    } catch (e) {
        console.log('*** token is not valid')
        response = false
    }
    res.json(response)
})

app.get('/oauthCallback', async (req, res) => {
    console.log(req.query.projectName);
    console.log(req.query.state);
    await getTokenSaveSession(req.query.code, req.query.state, res)
})

// dev-npouz6tu.auth0.com/authorize?response_type=code&scope=openid profile email&client_id=9XZwyehHLVqUj1bqSyRBc4i3VPiFKsAf&connection=dimon&redirect_uri=http://0.0.0.0:9080/auth0Callback&state=sfl

app.get('/auth0Callback', async (req, res) => {
    console.log(req.query.projectName);
    console.log(req.query.state);
    await aut0RedirectToProject(req.query.code, req.query.state, res)
})

app.get('/getUser', async (req, res) => {
    let email = req.query.email
    // let user = await getUser(email)
    let user = await getUserAuth0(email)
    const appKey = req.headers['am-app-key'];

    for (let i = 0; i < user.length; i++) {
        user[i].permissions = appKey ? await getUserPermissions(user[i].employee_id, appKey) : [];
        user[i].role = appKey ? await getUserRole(user[i].employee_id, appKey) : "";
    }

    res.json(user)
})

setInterval(() => {
    if (config.env === 'development') return
    metrics.sendMetricsSystem()
}, config.influxdb.intervalSystem)

setInterval(() => {
    if (config.env === 'development') return
    metrics.sendMetricsDisk()
}, config.influxdb.intervalDisk)

app.listen({port: PORT, host: HOST}, () => {
    console.log(`\n????\x1b[35m backend Running on  http://${HOST}:${PORT} Using node - { ${process.version} } ENV - { ${config.env} } \x1b[0m \n`)
})

