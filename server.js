const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deployment';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Demo in-memory storage. Data resets when the server restarts.
const users = [];
const admins = [{
  username: process.env.ADMIN_USERNAME || 'admin',
  // Default password: admin123
  password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqDOMk9jqveWi',
}];

const movies = [
  { id: 1, title: 'Inception', genre: 'Sci-Fi', rating: 4.8, year: 2010, status: 'completed' },
  { id: 2, title: 'Interstellar', genre: 'Sci-Fi', rating: 4.9, year: 2014, status: 'watching' },
  { id: 3, title: 'The Dark Knight', genre: 'Action', rating: 4.9, year: 2008, status: 'completed' },
  { id: 4, title: 'The Conjuring', genre: 'Horror', rating: 4.2, year: 2013, status: 'planned' },
  { id: 5, title: 'La La Land', genre: 'Romance', rating: 4.3, year: 2016, status: 'planned' },
  { id: 6, title: '3 Idiots', genre: 'Comedy', rating: 4.7, year: 2009, status: 'completed' },
  { id: 7, title: 'The Shawshank Redemption', genre: 'Drama', rating: 4.9, year: 1994, status: 'completed' },
];

let watchlist = movies.slice(0, 4);
let ratings = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user.email, type: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const admin = admins.find((a) => a.username === username);
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: admin.username, type: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

app.get('/api/movies/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  res.json(movies.filter((m) => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)));
});

app.get('/api/movies/genre/:genre', authenticateToken, (req, res) => {
  const genre = req.params.genre.toLowerCase();
  res.json(movies.filter((m) => m.genre.toLowerCase() === genre));
});

app.get('/api/movies/recent', authenticateToken, (req, res) => {
  res.json(movies.slice(0, 5));
});

app.get('/api/genres/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const genres = [...new Set(movies.map((m) => m.genre))];
  res.json(genres.filter((g) => g.toLowerCase().includes(q)).map((name) => ({ name })));
});

app.get('/api/genres/:genre', authenticateToken, (req, res) => {
  const genre = req.params.genre.toLowerCase();
  res.json(movies.filter((m) => m.genre.toLowerCase() === genre));
});

app.get('/api/watchlist', authenticateToken, (req, res) => res.json(watchlist));

app.get('/api/watchlist/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  res.json(watchlist.filter((m) => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)));
});

app.patch('/api/watchlist/:id/status', authenticateToken, (req, res) => {
  const item = watchlist.find((m) => String(m.id) === String(req.params.id));
  if (!item) return res.status(404).json({ message: 'Watchlist item not found' });
  item.status = req.body.status || item.status;
  res.json(item);
});

app.delete('/api/watchlist/:id', authenticateToken, (req, res) => {
  watchlist = watchlist.filter((m) => String(m.id) !== String(req.params.id));
  res.json({ message: 'Removed from watchlist' });
});

app.get('/api/recommendations', authenticateToken, (req, res) => res.json(movies));
app.get('/api/recommendations/search', authenticateToken, (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  res.json(movies.filter((m) => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)));
});

app.get('/api/ratings', authenticateToken, (req, res) => res.json(ratings));
app.post('/api/ratings', authenticateToken, (req, res) => {
  const rating = { id: Date.now(), ...req.body };
  ratings.push(rating);
  res.status(201).json(rating);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`MovieMate server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});
