const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database.js');
require('dotenv').config();
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
console.log("JWT Secret:", process.env.JWT_SECRET);


app.use(cors());
//app.use(bodyParser.json());

//server request-response
app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running!');
});

//Database-connection
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(500).send('Database connection failed');
        }
        res.send(`Database connected! Test result: ${results[0].result}`);
    });
});

//login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // Generate the token using the secret key
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token:', token);
        res.send({ token, userType: user.role, userId: user.id });

    });
});
//jwt-token auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Access denied, token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ message: 'Invalid token' });
        }
        req.user = user; // Attach the decoded user info
        next();
    });
};
//protected-endpoint
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Hello, user ID: ${req.user.userId}, Role: ${req.user.role}`);
});

//Admin- Fetching clients
app.get('/api/clients', authenticateToken, (req, res) => {
    const query = 'SELECT id, username FROM users WHERE role = "client"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching clients:', err.message);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.send(results);
    });
});

//Admin: Fetching food consumption details of a specific clients
app.get('/api/food-consumption/:clientId', authenticateToken, (req, res) => {
    const { clientId } = req.params;
    const query = 'SELECT * FROM food_consumption WHERE client_id = ? ORDER BY date DESC';
    db.query(query, [clientId], (err, results) => {
        if (err) {
            console.error('Error fetching food consumption:', err.message);
            return res.status(500).send({ message: 'Internal server error' });
        }
        res.send(results);
    });
});

//seeding data to database
app.post('/api/seed', async (req, res) => {
    try {
        // Insert clients
        await db.query(`
        INSERT IGNORE INTO clients (name, email, created_at, updated_at)
        VALUES 
        ('John Doe', 'john.doe@example.com', NOW(), NOW()),
        ('Jane Smith', 'jane.smith@example.com', NOW(), NOW());
      `);

        // Insert food consumption
        await db.query(`
        INSERT IGNORE INTO food_consumption (client_id, food_item, quantity, date, created_at, updated_at)
        VALUES 
        (1, 'Banana', 2, '2024-12-13', NOW(), NOW()),
        (1, 'Chicken Breast', 150, '2024-12-13', NOW(), NOW()),
        (2, 'Apple', 1, '2024-12-13', NOW(), NOW());
      `);

        res.send({ message: 'Database seeded successfully!' });
    } catch (error) {
        res.status(500).send({ error: 'Error seeding database' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
