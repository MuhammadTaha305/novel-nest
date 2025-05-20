const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Upload PDF
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('File uploaded:', req.file);
    const { book_title, authorName, book_description, category, image_url } = req.body;
    const { bookCollections } = getDB();
    
    // Create the uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const bookData = {
      book_title,
      authorName,
      book_description,
      category,
      image_url,
      book_pdf_url: `/uploads/${req.file.filename}`, // Store the relative path
      pdfFile: {
        filename: req.file.filename,
        path: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Book data to be saved:', bookData);
    const result = await bookCollections.insertOne(bookData);
    console.log('Book saved with ID:', result.insertedId);
    
    res.status(201).json({
      success: true,
      message: 'Book PDF uploaded successfully',
      bookId: result.insertedId
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      success: false,
      message: 'Error uploading PDF',
      error: error.message
    });
  }
};

// Get PDF
const getPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookCollections } = getDB();
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      console.log('Invalid book ID format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }

    const book = await bookCollections.findOne({ _id: objectId });
    console.log('Found book:', book ? 'Yes' : 'No');

    if (!book || !book.pdfFile) {
      console.log('Book or PDF not found');
      return res.status(404).json({
        success: false,
        message: 'Book or PDF not found'
      });
    }

    // Log the path
    console.log('PDF file path from DB:', book.pdfFile.path);
    const filePath = path.resolve(book.pdfFile.path);
    console.log('Resolved file path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('PDF file does not exist at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Set CORS headers explicitly for this response
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.pdfFile.originalName}"`);
    res.sendFile(filePath);

  } catch (error) {
    console.error("PDF retrieval error:", error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving PDF'
    });
  }
};

module.exports = {
  uploadPdf,
  getPdf
};