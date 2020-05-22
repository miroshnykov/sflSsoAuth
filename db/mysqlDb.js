const mysql = require('serverless-mysql')()
let mysqlDb
const config =  require('plain-config')()
module.exports = {

    get: () => {
        if (!mysqlDb) {
            console.log(`\n \x1b[35m First init DB \x1b[0m`)
            console.log(config.mysql)
            let mysqlConfig = {
                host: config.mysql.host,
                database: config.mysql.database,
                user: config.mysql.user,
                password: config.mysql.password,
                port: config.mysql.port
            }
            mysql.config(mysqlConfig)
            mysqlDb = mysql
        }
        // console.log(' << get singleton DB >>')
        return mysqlDb
    }
}
