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

        let employee = await dbMysql.query(`
            SELECT e.id, e.is_admin FROM employees e 
            LEFT JOIN am_employee_emails aee ON e.id = aee.employee_id 
            WHERE e.email = '${email}' OR aee.email = '${email}' 
            LIMIT 1
        `);

        await dbMysql.end();
        if (employee && employee[0]) {
            if (result && result[0])
            result[0].employee_id = employee[0].id;
            result[0].is_admin = employee[0].is_admin;
        }
        // console.timeEnd('getUser')
        // console.log(`getUser count:${result.length}\n`)
        return result
    } catch (e) {
        console.log(e)
    }
}

const getUserAuth0 = async (email) => {

    try {

        let result = await dbMysql.query(`
            select
                u.email as email,
                u.picture as picture
            from users u
            where u.email = '${email}'
        `)

        let employee = await dbMysql.query(`
            SELECT e.id, e.is_admin
            FROM employees e
                     LEFT JOIN am_employee_emails aee ON e.id = aee.employee_id
            WHERE e.email = '${email}'
               OR aee.email = '${email}' LIMIT 1
        `);
        await dbMysql.end();

        let userObj = {}
        userObj.email = email
        if (employee && employee[0]) {
            if (result && result[0]){
                result[0].employee_id = employee[0].id;
                result[0].is_admin = employee[0].is_admin;
            }
        }

        console.log(result)
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

const getUserPermissions = async (employeeId, appKey) => {
    try {
        let result = await dbMysql.query(`SELECT p.\`key\` FROM am_permissions AS p 
                INNER JOIN am_applications AS a ON p.application_id = a.id 
                INNER JOIN am_role_permissions AS rp ON p.id = rp.permission_id
                INNER JOIN am_roles AS r ON r.id = rp.role_id
                INNER JOIN am_employee_roles AS er ON er.role_id = r.id
                WHERE a.\`key\` = ? AND er.employee_id = ?;`, [appKey, employeeId]);

        await dbMysql.end();

        console.log('get permissions');
        console.log(result);

        const permissions = [];

        result.reduce((perms, perm) => {
            perms.push(perm.key);

            return perms;
        }, permissions);

        return permissions;
    } catch (e) {
        console.log(e)
    }
};

const getUserRole = async (employeeId) => {
    try {
        let result = await dbMysql.query(`SELECT r.name FROM am_roles AS r 
                INNER JOIN am_employee_roles AS er ON er.role_id = r.id
                WHERE er.employee_id = ?;`, [employeeId]);

        await dbMysql.end();

        console.log('get rolename');
        console.log(result);

        return result[0] ? result[0].name : '';
    } catch (e) {
        console.log(e)
    }
};

module.exports = {
    getUser,
    setUser,
    getUserPermissions,
    getUserRole,
    getUserAuth0
}