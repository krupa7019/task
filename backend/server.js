const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3307, // XAMPP MySQL port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        console.log('Connection details:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: 3307
        });
        return;
    }
    console.log('Database connected successfully');
    
    // Create users table if it doesn't exist
    connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Users table ready');
        }
    });
    
    connection.release();
});

// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const [result] = await pool.promise().execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.json({ 
            success: true, 
            message: 'Registration successful',
            token: 'dummy-token' // In a real app, generate a proper JWT token
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Start server
const PORT = 5000; // Use a different port than MySQL
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
