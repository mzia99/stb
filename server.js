const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(bodyParser.json());

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'stb_user',
  password: 'x8C@rVwS1Qgp0*zV',
  database: 'stb_db'
});

// Improved database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  initializeTables();
});

// Create necessary tables
const initializeTables = () => {
  var createTables = `
    CREATE TABLE if not exists users (
      id int NOT NULL AUTO_INCREMENT,
      name varchar(255) DEFAULT NULL,
      email varchar(255) DEFAULT NULL,
      password varchar(255) DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) `;
  db.query(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Database tables initialized');
    }
  });

  createTables = `CREATE TABLE if not exists stocks (
    id int NOT NULL AUTO_INCREMENT,
    user_id int NOT NULL,
    symbol varchar(10) NOT NULL,
    title varchar(100) NOT NULL,
    status enum('enabled','disabled') DEFAULT 'disabled',
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_symbol (user_id,symbol),
    CONSTRAINT stocks_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
  ) ;`;
  db.query(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Database tables initialized');
    }
  });

  createTables = `CREATE TABLE if not exists stock_meta (
    id int NOT NULL AUTO_INCREMENT,
    stock_id int NOT NULL,
    meta_key varchar(50) NOT NULL,
    meta_value text,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY stock_id (stock_id),
    CONSTRAINT stock_meta_ibfk_1 FOREIGN KEY (stock_id) REFERENCES stocks (id) ON DELETE CASCADE
  ) ;`;

  db.query(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Database tables initialized');
    }
  });
};

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error('Invalid token:', err);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// User Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [existingUsers] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Fetch user's stocks
app.get('/stocks', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching stocks for user ID:', req.user.id);
    const [stocks] = await db.promise().query(
      `SELECT s.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', sm.id,
            'meta_key', sm.meta_key,
            'meta_value', sm.meta_value
          )
        ) as meta
      FROM stocks s
      LEFT JOIN stock_meta sm ON s.id = sm.stock_id
      WHERE s.user_id = ?
      GROUP BY s.id`,
      [req.user.id]
    );
    
    console.log('Stocks fetched:', stocks);
    
    const parsedStocks = stocks.map(stock => ({
      ...stock,
      meta: JSON.parse(stock.meta).filter(m => m.id !== null)
    }));

    res.json(parsedStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks', details: error.message });
  }
});




// Add new stock
app.post('/stocks', authenticateToken, async (req, res) => {
  const { symbol, title, status, meta } = req.body;
  console.log('Request to add stock:', req.body); // Log request data
  try {
    await db.promise().beginTransaction();

    const [result] = await db.promise().query(
      'INSERT INTO stocks (user_id, symbol, title, status) VALUES (?, ?, ?, ?)',
      [req.user.id, symbol, title, status]
    );

    console.log('Stock added with ID:', result.insertId); // Log stock ID

    if (meta && meta.length > 0) {
      const metaValues = meta.map(m => [result.insertId, m.meta_key, m.meta_value]);
      await db.promise().query(
        'INSERT INTO stock_meta (stock_id, meta_key, meta_value) VALUES ?',
        [metaValues]
      );
    }

    await db.promise().commit();
    res.status(201).json({ message: 'Stock added successfully', id: result.insertId });
  } catch (error) {
    await db.promise().rollback();
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Update stock
app.put('/stocks/:id', authenticateToken, async (req, res) => {
  const { symbol, title, status, meta } = req.body;
  const stockId = req.params.id;

  try {
    await db.promise().beginTransaction();

    await db.promise().query(
      'UPDATE stocks SET symbol = ?, title = ?, status = ? WHERE id = ? AND user_id = ?',
      [symbol, title, status, stockId, req.user.id]
    );

    await db.promise().query('DELETE FROM stock_meta WHERE stock_id = ?', [stockId]);

    if (meta && meta.length > 0) {
      const metaValues = meta.map(m => [stockId, m.meta_key, m.meta_value]);
      await db.promise().query(
        'INSERT INTO stock_meta (stock_id, meta_key, meta_value) VALUES ?',
        [metaValues]
      );
    }

    await db.promise().commit();
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    await db.promise().rollback();
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

//

// Delete stock
app.delete('/stocks/:id', authenticateToken, async (req, res) => {
  const stockId = req.params.id;

  try {
    const [result] = await db.promise().query(
      'DELETE FROM stocks WHERE id = ? AND user_id = ?',
      [stockId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock not found or unauthorized' });
    }

    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: 'Failed to delete stock' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
