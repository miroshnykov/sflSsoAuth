let dbMysql = require('./mysqlDb').get()

const getUser = async (email) => {

    try {
        // console.time('getUser')
        let result = await dbMysql.query(` 
            select 
                u.google_id as googleId,
                u.name as name,
                u.email as email,
                u.given_name as givenName,
                u.family_name as familyName,
                u.picture as picture,
                u.link as link,
                u.hd as hd 
            from google_oauth2_user u 
            where u.email = '${email}'
        `)
        await dbMysql.end()

        // console.timeEnd('getUser')
        // console.log(`getUser count:${result.length}\n`)
        return result
    } catch (e) {
        console.log(e)
    }
}

const setUser = async (data) => {

    const {id, email, name, given_name, family_name, picture, link, hd} = data

    try {
        console.time('setUser')

        let result = await dbMysql.query(` 
            INSERT IGNORE INTO google_oauth2_user (email, google_id, name, given_name, family_name, picture, link, hd) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [email, id,name, given_name, family_name, picture, link, hd])
        await dbMysql.end()

        console.timeEnd('setUser')
        return result
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    getUser,
    setUser
}