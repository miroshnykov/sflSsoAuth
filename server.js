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

const PORT = config.port
const HOST = config.host

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

const getOAuthClient = () => (new oAuth2(clientId, clientSecret, oauthCallback))

const getAuthUrl = () => {
    let oauth2Client = getOAuthClient()
    let scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    })

}

const getTokenSaveSession = async (code, res) => {
    let oauth2Client = getOAuthClient()
    return oauth2Client.getToken(code, (err, tokens) => {

        if (!err) {
            oauth2Client.setCredentials(tokens)
            let sessionId = v4()
            getUserInfo(tokens).then((info) => {

                if (info.hd === 'actionmediamtl.com' ||
                    info.hd === 'grindstonecapital.ca' ||
                    info.hd === 'hyuna.bb'
                ) {

                    res.redirect(`${config.googleAuth.redirectToOptiPlatformsuccess}id=${sessionId}&email=${info.email}`)
                } else {
                    let emailToSend = info.email.split('.').join("")
                    res.redirect(`${config.googleAuth.redirectToOptiPlatformerrorlogin}${emailToSend}`)
                }
            })

        } else {
            console.error('err:', err)
            res.redirect(`${config.googleAuth.redirectToOptiPlatformerrorlogin}/error`)
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
    let url = getAuthUrl()
    console.log('loginUrl:', url)
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
    await getTokenSaveSession(req.query.code, res)
})

app.get('/successlogin', async (req, res) => {

    console.log('successlogin')
    console.log(req.query)
    let token = jwt.sign({email: req.query.email, id: req.query.id}, config.jwt_secret, {expiresIn: '1h'})
    let bytes = utf8.encode(token);
    let encoded = base64.encode(bytes);

    res.redirect(`${config.googleAuth.redirectToOptiPlatformsuccesslogin}${encoded}`)
})

app.get('/errorlogin', async (req, res) => {
    console.log(` *** google auth error by this email:${req.query.email}`)
    res.redirect(`${config.googleAuth.redirectToOptiPlatformerrorlogin}${req.query.email}`)
    // await getTokenSaveSession(req.query.code, res)
})

app.get('/getUser', async (req, res) => {
    let email = req.query.email
    let user = await getUser(email)
    res.json(user)
})

app.listen({port: PORT, host: HOST}, () =>
    console.log(`\n🚀\x1b[35m backend Running on  http://${HOST}:${PORT} \x1b[0m \n`)
)

