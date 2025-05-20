const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { pdfUpload } = require('../middleware/upload');

// PDF routes
router.post('/upload', pdfUpload.single('pdf'), pdfController.uploadPdf);
router.get('/:id', pdfController.getPdf);

module.exports = router;