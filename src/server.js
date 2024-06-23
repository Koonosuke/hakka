const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3001;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(bodyParser.json());

// Static files
app.use(express.static('public'));

// User registration
app.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY);
            res.json({ token });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add transaction
app.post('/transactions', async (req, res) => {
    const { token, date, name, amount, type } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.id;
        const result = await pool.query(
            'INSERT INTO transactions (user_id, date, name, amount, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, date, name, amount, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get transactions
app.get('/transactions', async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.id;
        const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
