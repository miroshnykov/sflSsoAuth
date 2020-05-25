# SSO AUTH
> general authentification  

# get Url for auth 

> http://0.0.0.0:9080/loginUrl

# verify Token

> http://0.0.0.0:9080/verifyToken
 
# local setup config 


    config.port = 9080
    config.host = '0.0.0.0'

    config.mysql.host = 'localhost'
    config.mysql.port = 3007
    config.mysql.user = 'root'
    config.mysql.password = ''
    config.mysql.database = 'jomedia2'
    config.jwt_secret = 'hrenVam'

    config.googleAuth.oauthCallback = 'http://localhost:9080/oauthCallback/'

    config.googleAuth.pcapi.successLogin = 'http://localhost:8080/#/successLogin/'
    config.googleAuth.pcapi.errorLogin = 'http://localhost:8080/#/errorLogin/'

    config.googleAuth.opti.successLogin = 'http://localhost:8080/#/successLogin/'
    config.googleAuth.opti.errorLogin = 'http://localhost:8080/#/errorLogin/'

    config.googleAuth.sfl.successLogin = 'http://localhost:8080/#/successLogin/'
    config.googleAuth.sfl.errorLogin = 'http://localhost:8080/#/errorLogin/'

    config.googleAuth.clientId = ''
    config.googleAuth.clientSecret = ''
