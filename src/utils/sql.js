const mysql = require("mysql2/promise");

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

async function createTables() {
    try {
        await connection.query(
            "CREATE TABLE IF NOT EXISTS suggestions (id INT PRIMARY KEY AUTO_INCREMENT, category TEXT, userId TEXT, suggestion TEXT, msgId TEXT, upvotes INT DEFAULT(0), downvotes INT DEFAULT(0), users TEXT DEFAULT(NULL))"
        );
    } catch (error) {
        throw error;
    }
}

function insertSuggestion(userId, msgId, suggestion, category) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO suggestions (userId, msgId, category, suggestion) VALUES (?, ?, ?, ?)", [userId, msgId, category, suggestion])
        .then(([rows, fields]) => {
            resolve(rows.insertId);
        })
        .catch(err => reject(err))
    })
}

function getSuggestions() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM suggestions")
        .then(([rows, fields]) => {
            resolve(rows);
        })
        .catch(err => reject(err))
    })
}

function deleteSuggestion(id) {
    return connection.query("DELETE FROM suggestions WHERE id = ?", [id])
}

function updateVotes(id, suggestion, users, toUpdate) {
    return connection.query(`UPDATE suggestions SET ${toUpdate}=?,users=? WHERE id = ?`, [
            suggestion[toUpdate],
            users,
            id
        ])
}

module.exports = {
    createTables, insertSuggestion,
    getSuggestions, deleteSuggestion,
    updateVotes
}