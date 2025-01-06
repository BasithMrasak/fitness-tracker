const mysql = require('mysql2/promise');

// Create a connection pool for efficient query handling
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fitness_tracker',
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your server's capacity
    queueLimit: 0,
});

// Test the connection when the application starts
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }
})();

module.exports = pool;
