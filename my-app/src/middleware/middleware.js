const express = require('express');
const cors = require('cors');
const path = require('path');

const setupMiddleware = (app) => {
   // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

  // CORS middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Increase payload size limit to 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Debug middleware - log all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
};

module.exports = { setupMiddleware };