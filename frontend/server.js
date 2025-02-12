const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'YOUR_PASSWORD', // Use environment variable for DB password
    database: process.env.DB_NAME || 'login',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.code, err.message);
        process.exit(1);
    }
    console.log('Connected to the database!');
});

// User routes (signup, signin)
app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Ensure role is provided
    if (!role) {
        return res.status(400).send({ message: 'Role is required.' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

        db.query(query, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).send({ message: `Signup failed: ${err.message}` });
            } else {
                return res.status(201).send({ message: 'User registered successfully.' });
            }
        });
    } catch (error) {
        console.error('Error during signup:', error.message);
        return res.status(500).send({ message: `Signup failed: ${error.message}` });
    }
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT id, password, role FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Login failed due to a server error.' });
        }

        if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
            return res.status(200).send({ 
                message: 'Login successful.', 
                userId: results[0].id,
                role: results[0].role // Include role in the response
            });
        } else {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }
    });
});

// Profile route
app.get('/api/profile', (req, res) => {
    const userId = req.headers['user-id'];  

    console.log("Incoming request - User ID:", userId); // Debugging log

    if (!userId) {
        return res.status(400).send({ message: 'User ID is required.' });
    }

    const query = 'SELECT name, email, role, contact FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: 'Failed to fetch profile data.' });
        }

        if (results.length === 0) {
            console.log('User not found in database.');
            return res.status(404).send({ message: 'User not found.' });
        }

        const user = results[0];

        res.status(200).send({
            name: user.name || 'Unknown User',
            email: user.email || 'No Email Provided',
            role: user.role || 'No Role Assigned',
            contact: user.contact || null,
        });
    });
});

const multer = require('multer');
const path = require('path');

// Set up multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

app.post('/api/profile', upload.single('profilePic'), (req, res) => {
    const { userId, contact } = req.body;
    const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !contact) {
        return res.status(400).json({ message: 'User ID and contact number are required.' });
    }

    const updateQuery = profilePicUrl 
        ? 'UPDATE users SET contact = ?, profilePicUrl = ? WHERE id = ?'
        : 'UPDATE users SET contact = ? WHERE id = ?';

    const queryParams = profilePicUrl 
        ? [contact, profilePicUrl, userId]
        : [contact, userId];

    db.query(updateQuery, queryParams, (err) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to update profile.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.' });
    });
});

// Add resource route
app.post('/api/resources', (req, res) => {
    const { resourceName, email, quantity, quality } = req.body;

    const query = 'INSERT INTO resources (resourceName, email, quantity, quality) VALUES (?, ?, ?, ?)';

    db.query(query, [resourceName, email, quantity, quality], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: `Failed to add resource: ${err.message}` });
        } else {
            return res.status(201).send({ message: 'Resource added successfully.' });
        }
    });
});


// Fetch available resources route
app.get('/api/resources', (req, res) => {
    const query = 'SELECT resourceName, email, quantity, quality FROM resources';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: 'Failed to fetch resources.' });
        } else {
            return res.status(200).send(results);
        }
    });
});



// Book resource route
app.post('/api/bookings', (req, res) => {
    const { resourceName, quantity, date, startTime, endTime } = req.body;

    // Update resource quantity
    const updateQuery = 'UPDATE resources SET quantity = quantity - ? WHERE resourceName = ? AND quantity >= ?';

    db.query(updateQuery, [quantity, resourceName, quantity], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: `Failed to book resource: ${err.message}` });
        } else if (result.affectedRows === 0) {
            return res.status(400).send({ message: 'Insufficient resource quantity.' });
        } else {
            const bookingQuery = 'INSERT INTO bookings (resourceName, quantity, date, startTime, endTime) VALUES (?, ?, ?, ?, ?)';

            db.query(bookingQuery, [resourceName, quantity, date, startTime, endTime], (err, result) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).send({ message: `Failed to book resource: ${err.message}` });
                } else {
                    return res.status(201).send({ message: 'Resource booked successfully.' });
                }
            });
        }
    });
});


// Fetch all bookings without user details
app.get('/api/bookings', (req, res) => {
    const query = `
        SELECT 
            resourceName, 
            quantity, 
            date, 
            startTime, 
            endTime
        FROM bookings
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: 'Failed to fetch bookings.' });
        } else {
            return res.status(200).json(results);
        }
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
