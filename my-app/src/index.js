require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { setupMiddleware } = require('./middleware/middleware');
const { setupUploadDirectory } = require('./utils/fileSystem');
const bookRoutes = require('./routes/bookRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Setup uploads directory
setupUploadDirectory();

// Setup middleware
setupMiddleware(app);

// Root route
app.get('/', (req, res) => {
  res.send("hello world");
});

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/users', userRoutes);

// Legacy routes
app.use('/all-books', (req, res) => {
  const { query } = req;
  res.redirect(`/api/books${query ? `?${new URLSearchParams(query).toString()}` : ''}`);
});

app.use('/book/:id', (req, res) => {
  res.redirect(`/api/books/${req.params.id}`);
});

app.use('/upload-book', (req, res, next) => {
  if (req.method === 'POST') {
    req.url = '/api/books';
  }
  next();
});

app.use('/chapters/:bookId', (req, res) => {
  res.redirect(`/api/books/${req.params.bookId}/chapters`);
});

app.use('/upload-chapter', (req, res, next) => {
  if (req.method === 'POST') {
    req.url = '/api/chapters';
  }
  next();
});

// Start server and connect to database
async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);