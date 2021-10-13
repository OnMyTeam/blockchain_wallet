var mysql = require('mysql');
const conn_info = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '5404243a',
    database: 'walletdb'
}
module.exports = {
    init: function () {
        return mysql.createConnection(conn_info);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err);
            else console.log('mysql is connected successfully!');
        });
    }
}