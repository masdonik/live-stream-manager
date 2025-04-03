const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const systemMonitor = require('./utils/systemMonitor');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/live', require('./routes/live'));
app.use('/download', require('./routes/download'));

// Root route
app.get('/', (req, res) => {
  res.redirect('/live');
});

// System metrics API endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await systemMonitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil metrik sistem' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Terjadi kesalahan pada server' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: '404 Not Found',
    message: 'Halaman tidak ditemukan' 
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});