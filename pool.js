var mysql = require('mysql2/promise');

const pool = mysql.createPool(
{
    host: "sql7.freesqldatabase.com",
    user: "sql7387387",
    password: process.env.DBPASS,
    database: "sql7387387",
    port: 3306,
});
module.exports = pool;