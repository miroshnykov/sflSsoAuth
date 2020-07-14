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
const {getUser, setUser} = require('./db/user')

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

const getAuthUrl = (projectName) => {
    let oauth2Client = getOAuthClient()
    let scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify({project: projectName}),
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
            getUserInfo(tokens).then((info) => {

                if (info.hd === 'actionmediamtl.com' ||
                    info.hd === 'grindstonecapital.ca' ||
                    info.hd === 'hyuna.bb'
                ) {
                    let token = jwt.sign({email: info.email, id: sessionId}, config.jwt_secret, {expiresIn: '1h'})
                    let bytes = utf8.encode(token);
                    let encoded = base64.encode(bytes);

                    res.redirect(`${successLogin}${encoded}`)
                } else {
                    let emailToSend = info.email.split('.').join("")
                    console.log(`Wrong domaine name ${emailToSend}`)
                    res.redirect(`${errorLogin}${emailToSend}`)
                }
            })

        } else {
            console.error('err:', err)
            res.redirect(`${errorLogin}/error`)
        }
    })
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

    return info.data
}

app.get('/health', (req, res, next) => {
    res.send('Ok')
})

app.get('/loginUrl', (req, res) => {
    let url = getAuthUrl(req.query.projectName)
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
    await getTokenSaveSession(req.query.code, req.query.state, res)
})


app.get('/getUser', async (req, res) => {
    let email = req.query.email
    let user = await getUser(email)
    res.json(user)
})

setInterval(() => {
    console.log(' interval system config.env:', config.env)
    if (config.env === 'development') return
    metrics.sendMetricsSystem()
}, config.influxdb.intervalSystem)

setInterval(() => {
    console.log('interval Disk config.env:', config.env)
    if (config.env === 'development') return
    metrics.sendMetricsDisk()
}, config.influxdb.intervalDisk)

app.listen({port: PORT, host: HOST}, () =>
    console.log(`\n🚀\x1b[35m backend Running on  http://${HOST}:${PORT} \x1b[0m \n`)
)

