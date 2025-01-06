const express = require('express');
const cors = require('cors');
const pool = require('./database'); // Import the promise-based pool
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

console.log("JWT Secret:", JWT_SECRET);

// Test API endpoint
app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running!');
});

// Database connection test
app.get('/test-db', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT 1 + 1 AS result');
        res.send(`Database connected! Test result: ${results[0].result}`);
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).send('Database connection failed');
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await pool.query(
            'SELECT id, username, password, role FROM users WHERE username = ?',
            [username]
        );

        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const user = results[0];
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Generated Token:', token);
        res.send({ token, userType: user.role, userId: user.id });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Access denied, token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Protected endpoint
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Hello, user ID: ${req.user.userId}, Role: ${req.user.role}`);
});

// ADMIN_FUNCTIONALITIES
// Fetch all clients
app.get('/api/clients', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    try {
        const [results] = await pool.query(
            `SELECT u.id AS user_id, u.username, c.first_name, c.last_name, c.dob
             FROM users u
             LEFT JOIN clients c ON u.id = c.user_id
             WHERE u.role = 'client'`
        );
        res.send(results);
    } catch (err) {
        console.error('Error fetching clients:', err.message);
        res.status(500).send({ error: 'Error fetching clients' });
    }
});

// Add a new client
app.post('/api/clients', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    const { username, password, first_name, last_name, dob } = req.body;

    if (!username || !password || !first_name || !last_name || !dob) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            `INSERT INTO users (username, password, role, created_at, updated_at)
             VALUES (?, ?, 'client', NOW(), NOW())`,
            [username, password]
        );

        const userId = userResult.insertId;

        await connection.query(
            `INSERT INTO clients (user_id, first_name, last_name, dob, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [userId, first_name, last_name, dob]
        );

        await connection.commit();
        res.status(201).send({ message: 'Client added successfully!' });
    } catch (err) {
        await connection.rollback();
        console.error('Error adding client:', err.message);
        res.status(500).send({ error: 'Error adding client' });
    } finally {
        connection.release();
    }
});

// Delete a client
app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // First, delete from clients table
        const [clientResult] = await connection.query('DELETE FROM clients WHERE user_id = ?', [id]);

        if (clientResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({ error: 'Client not found' });
        }

        // Then, delete from users table
        const [userResult] = await connection.query('DELETE FROM users WHERE id = ?', [id]);

        if (userResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).send({ error: 'User not found' });
        }

        await connection.commit();
        res.status(200).send({ message: 'Client deleted successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Error deleting client:', err.message);
        res.status(500).send({ error: 'Failed to delete client' });
    } finally {
        connection.release();
    }
});

// Fetch food consumption for all clients (Admin only)
app.get('/api/food-consumption', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    try {
        const [results] = await pool.query(
            `SELECT fc.*, c.first_name, c.last_name 
             FROM food_consumption fc
             JOIN clients c ON fc.client_id = c.user_id
             ORDER BY fc.date DESC`
        );
        res.send(results);
    } catch (err) {
        console.error('Error fetching food consumption:', err.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Fetch specific client's food consumption (only admin access)
app.get('/api/food-consumption/:clientId', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: 'Access denied' });
    }

    const { clientId } = req.params; // Extract clientId from the URL parameter

    try {
        const [results] = await pool.query(
            `SELECT fc.*, c.first_name, c.last_name 
             FROM food_consumption fc
             JOIN clients c ON fc.client_id = c.user_id
             WHERE fc.client_id = ? 
             ORDER BY fc.date DESC`,
            [clientId]
        );

        if (results.length === 0) {
            return res.status(404).send({ message: `No food consumption records found for client ID ${clientId}` });
        }

        res.send(results);
    } catch (err) {
        console.error('Error fetching specific client food consumption:', err.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});


//CLIENT_FUNCTIONALITIES
// Get client details
app.get('/api/client-details', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    console.log('Fetching client details for user ID:', userId);

    try {
        const [results] = await pool.query(
            `SELECT user_id, first_name, last_name, dob, created_at, updated_at 
             FROM clients 
             WHERE user_id = ?`,
            [userId]
        );

        if (results.length === 0) {
            return res.status(404).send({ message: 'Client details not found' });
        }

        res.send(results[0]);
    } catch (err) {
        console.error('Error fetching client details:', err.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Add food consumption
app.post('/api/food-consumption', authenticateToken, async (req, res) => {
    const { food_item, quantity, date } = req.body;
    const clientId = req.user.userId;

    if (!food_item || !quantity || !date) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO food_consumption 
             (client_id, food_item, quantity, date, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [clientId, food_item, quantity, date]
        );

        res.status(201).send({
            message: 'Food consumption record added successfully!',
            id: result.insertId
        });
    } catch (err) {
        console.error('Error adding food consumption:', err.message);
        res.status(500).send({ error: 'Failed to add food consumption' });
    }
});

// Get client's own food consumption
app.get('/api/client-food-consumption', authenticateToken, async (req, res) => {
    const clientId = req.user.userId;

    try {
        const [results] = await pool.query(
            `SELECT id, food_item, quantity, date 
             FROM food_consumption 
             WHERE client_id = ? 
             ORDER BY date DESC`,
            [clientId]
        );

        res.send(results);
    } catch (err) {
        console.error('Error fetching client food consumption:', err.message);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
