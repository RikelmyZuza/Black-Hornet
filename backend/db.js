const path   = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mysql  = require("mysql2/promise");
 
const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10
});
 
pool.getConnection()
    .then(conn => {
        console.log("✅ Banco de dados conectado com sucesso.");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Erro ao conectar com o banco de dados:", err.message);
    });
 
module.exports = pool;
 