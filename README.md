# local setup config 

- Refer to the wiki page of the project. There is 2 files need to copy. 
    - copy config-local.js into ./conf folder 
    - copy .env file in / directtory of the project.
    - edit /etc/hosts and add the following
        > 127.0.0.1       ssoauth-local.surge.systems

# Init
- run the following: 
    > docker-composde build && docker-compose up






# SSO AUTH
> general authentification  

# get Url for auth 

> http://0.0.0.0:9080/loginUrl

# verify Token

> http://0.0.0.0:9080/verifyToken

# start

> node server.js
 

