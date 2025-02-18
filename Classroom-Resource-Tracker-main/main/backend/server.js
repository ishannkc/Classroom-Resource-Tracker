const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cron = require('node-cron'); // Added for scheduled tasks

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'YOUR_PASSWORD', // Use environment variable for DB password
    database: process.env.DB_NAME || 'login',
    port: process.env.DB_PORT || 3306,
    timezone: '+05:45' // Set timezone to Asia/Kathmandu
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
    const { resourceName, email, quantity } = req.body;

    // Convert quantity to a number
    const parsedQuantity = parseInt(quantity, 10);

    // Check if the resource with the same name already exists
    const checkQuery = 'SELECT id, quantity FROM resources WHERE resourceName = ?';
    db.query(checkQuery, [resourceName], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: `Failed to add resource: ${err.message}` });
        }

        if (results.length > 0) {
            // Resource exists, update its quantity
            const existingResource = results[0];
            const newQuantity = existingResource.quantity + parsedQuantity; // Add the quantities as numbers
            const updateQuery = 'UPDATE resources SET quantity = ? WHERE id = ?';
            db.query(updateQuery, [newQuantity, existingResource.id], (err, result) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).send({ message: `Failed to update resource: ${err.message}` });
                } else {
                    return res.status(200).send({ message: 'Resource quantity updated successfully.' });
                }
            });
        } else {
            // Resource does not exist, insert new resource
            const insertQuery = 'INSERT INTO resources (resourceName, email, quantity) VALUES (?, ?, ?)';
            db.query(insertQuery, [resourceName, email, parsedQuantity], (err, result) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).send({ message: `Failed to add resource: ${err.message}` });
                } else {
                    return res.status(201).send({ message: 'Resource added successfully.' });
                }
            });
        }
    });
});

// Fetch available resources route
app.get('/api/resources', (req, res) => {
    const query = 'SELECT resourceName, email, quantity FROM resources';

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

    // Convert date to UTC before storing
    const dateInUTC = new Date(date).toISOString().split('T')[0];

    // Check if the quantity requested is valid
    if (quantity <= 0) {
        return res.status(400).send({ message: 'Quantity must be greater than zero.' });
    }

    // Update resource quantity
    const updateQuery = `
        UPDATE resources 
        SET quantity = quantity - ? 
        WHERE resourceName = ? AND quantity >= ?`;

    db.query(updateQuery, [quantity, resourceName, quantity], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send({ message: `Failed to book resource: ${err.message}` });
        } 
        if (result.affectedRows === 0) {
            return res.status(400).send({ message: 'Insufficient resource quantity.' });
        } 

        const bookingQuery = `
            INSERT INTO bookings (resourceName, quantity, date, startTime, endTime) 
            VALUES (?, ?, ?, ?, ?)`;

            db.query(bookingQuery, [resourceName, quantity, dateInUTC, startTime, endTime], (err, result) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).send({ message: `Failed to book resource: ${err.message}` });
                }
                res.status(201).send({ message: 'Resource booked successfully.' });
            });
        });
    });
    
    // Fetch all bookings without user details
    app.get('/api/bookings', (req, res) => {
        const query = `
            SELECT 
                resourceName, 
                quantity, 
                DATE_FORMAT(CONVERT_TZ(date, '+00:00', @@session.time_zone), '%Y-%m-%dT%H:%i:%s.000Z') AS date,
                TIME_FORMAT(startTime, '%H:%i:%s') AS startTime,
                TIME_FORMAT(endTime, '%H:%i:%s') AS endTime
            FROM bookings
        `;
    
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).send({ message: 'Failed to fetch bookings.' });
            }
            console.log('Bookings from Database:', results); // Debugging log
            return res.status(200).json(results);
        });
    });
    
    const moment = require('moment-timezone');
    
    // Function to return resources after booking expiration
    const returnResources = () => {
        const currentDateTime = moment().tz('Asia/Kathmandu').format('YYYY-MM-DD HH:mm:ss');
    
        console.log('Checking for expired bookings at:', currentDateTime); // Debugging log
    
        // Query to find expired bookings
        const query = `
            SELECT id, resourceName, quantity 
            FROM bookings 
            WHERE STR_TO_DATE(CONCAT(date, ' ', endTime), '%Y-%m-%d %H:%i:%s') <= ?
        `;
    
        db.query(query, [currentDateTime], (err, results) => {
            if (err) {
                console.error('Database error:', err.message);
                return;
            }
    
            console.log('Expired Bookings:', results); // Debugging log
    
            if (results.length === 0) {
                console.log('No expired bookings found.');
                return;
            }
    
            results.forEach(booking => {
                console.log(`Processing booking ID ${booking.id} for resource ${booking.resourceName}`); // Debugging log
    
                // Return the resource quantity to the resources table
                const updateQuery = 'UPDATE resources SET quantity = quantity + ? WHERE resourceName = ?';
                db.query(updateQuery, [booking.quantity, booking.resourceName], (err, result) => {
                    if (err) {
                        console.error('Database error:', err.message);
                        return;
                    }
    
                    if (result.affectedRows === 0) {
                        console.error(`Resource ${booking.resourceName} not found in resources table.`);
                        return;
                    }
    
                    console.log(`Resource ${booking.resourceName} quantity updated.`); // Debugging log
    
                    // Delete the expired booking from the bookings table
                    const deleteQuery = 'DELETE FROM bookings WHERE id = ?';
                    db.query(deleteQuery, [booking.id], (err, result) => {
                        if (err) {
                            console.error('Database error:', err.message);
                            return;
                        }
                        console.log(`Booking ID ${booking.id} deleted.`); // Debugging log
                    });
                });
            });
        });
    };
    
    // Schedule the job to run every minute
    cron.schedule('* * * * *', () => {
        console.log('Running scheduled job to return resources...');
        returnResources();
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
    