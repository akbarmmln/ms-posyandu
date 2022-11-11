module.exports = {
    mysql: {
        hostname: process.env.MYSQL_HOSTNAME,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
        dbname: process.env.MYSQL_DATABASE,
    },
    email: {
        hostname: process.env.HOST_MAIL,
        username: process.env.USER_MAIl,
        password: process.env.PASS_MAIL,
        port: process.env.PORT_MAIL
    }
};