/*Maghdie Petersen 
230600204
Class 3.I 
Group MM3
Last Date and Time worked on: Friday 09 October 2026 16:22
*/

//Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

//Enable Cross-Origin Resource Sharing, JSON Body Parsing, and HTML form Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})); // <-- CRITICAL: Allows HTML form submissions to be read

//Serve all static web pages from the 'public' directory 
app.use(express.static(path.join(__dirname, 'public')));

//Connect to local MySQL database using port 3306 from environment variables
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eventhub_db',
    waitForConnections: true,
    connectionLimit: 10
});

//TEST DATABASE CONNECTION ON BOOT
(async () => {
    try {
        const connection = await dbPool.getConnection();
        console.log('✅ Successfully connected to the MYSQL database!');
        connection.release();
    } catch (err) {
        console.error('❌ Failed to connect to MYSQL database!', err.message);
    }
})();

//GET Route: Retrieve events with optional filters(category, province, serach term, evnt ID)
app.get('/api/events', async (req, res) => {
    try {
        const { province, category, search, featured, id } = req.query;

        let querySql = `
        SELECT
        e.event_id AS id,
        e.title,
        e.description,
        e.ticket_price AS price,
        e.category,
        e.is_featured AS featured,
        l.area_suburb AS loc,
        l.province_state AS scope,
        s.event_date AS date,
        s.start_time AS time,
        u.full_name AS organizer
        FROM events e
        JOIN locations l ON e.location_id = l.location_id
        JOIN schedules s ON e.schedule_id = s.schedule_id
        JOIN users u ON e.organizer_id = u.user_id
        WHERE 1=1
        `;
        const queryParams = [];

        if (id) {
            querySql += ` AND e.event_id = ?`;
            queryParams.push(id);
        }
        if (province && province !== 'National') {
            querySql += ` AND l.province_state = ?`;
            queryParams.push(province);
        }
        if (category) {
            querySql += ` AND e.category IN (?)`;
            queryParams.push(category.split(','));
        }
        if (search) {
            querySql += ` AND (e.title LIKE ? OR e.description LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (featured === 'true') {
            querySql += ` AND e.is_featured = TRUE`;
        }

        querySql += ` ORDER BY s.event_date ASC`;

        const [rows] = await dbPool.query(querySql, queryParams);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Database Query Error:', error);
        res.status(500).json({ success: false, message: 'Server internal error.' });
    }
});

//POST Route: Save a new event into MySQL using transactional queries
app.post('/api/events', async (req, res) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        const { title, category, description, price, area, province, date, time } = req.body;

        //Insert new location entry
        const [locResult] = await connection.query(
            'INSERT INTO locations (area_suburb, province_state) VALUES (?, ?)',
            [area, province]
        );

        //Insert new schedule entry
        const [schResult] = await connection.query(
            'INSERT INTO schedules (event_date, start_time) VALUES (?, ?)',
            [date, time]
        );

        //Insert main event linking generated location and schedule IDs
        await connection.query(
            'INSERT INTO events (organizer_id, location_id, schedule_id, title, description, ticket_price, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [1, locResult.insertId, schResult.insertId, title, description, price || 0.00, category]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Event created Successfully!'
        });

    } catch (error) {
        await connection.rollback();

        console.error('Event Creation Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to save event.'
        });

    } finally {
        connection.release();
    }
});

//POST Route: Handle user registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        await dbPool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [fullName, email, password]
        );
        res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ success: false, message: 'Email already exists or invalid data.' });
    }
});

//POST Route: Handle user login authorization
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await dbPool.query(
            `SELECT user_id, full_name, email, role FROM users WHERE email = ? AND password_hash = ?`,
            [email, password]
        );

        if (rows.length > 0) {
            res.status(200).json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Authentication process failed.' });
    }
});

//Start Express server
app.listen(PORT, () => console.log(`EventHub server running at http://localhost:${PORT} `));