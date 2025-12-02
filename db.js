// db.js
const mysql = require("mysql2/promise");

let connection;

async function initDB() {
    if (!connection) {
        connection = await mysql.createPool({
            host: "localhost",
            user: "root",
            password: "n0m3l0",
            database: "feriaLibro",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log("✔ Conectado a MySQL (Pool)");
    }

    return connection;
}

module.exports = initDB();
