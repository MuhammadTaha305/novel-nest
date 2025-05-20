const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Helper function to validate URL (must be http/https)
function isValidUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const { bookCollections } = getDB();
    let query = {};
    if (req.query?.category) {
      query = { category: req.query.category };
    }
    const result = await bookCollections.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching books'
    });
  }
};

// Get books by author ID
const getBooksByAuthor = async (req, res) => {
  try {
    // Try to get authorId from multiple possible locations
    const authorId = req.headers['author-id'] || 
                     req.params.authorId ||
                     req.query.authorId || 
                     req.query.author;
    
    console.log("Author ID received:", authorId);
    console.log("Headers:", req.headers);
    console.log("URL params:", req.params);
    console.log("Query params:", req.query);
    
    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: 'Author ID is required. Please provide it in the headers as Author-ID, in URL parameters, or in query parameters.'
      });
    }

    const { bookCollections, chapterCollections } = getDB();
    
    // Try multiple fields that might contain author ID
    const books = await bookCollections.find({ 
      $or: [
        { authorId: authorId },
        { author_id: authorId },
        { 'author.id': authorId }
      ]
    }).toArray();
    
    console.log(`Found ${books.length} books for author: ${authorId}`);
    
    // If no books found, return empty array with success
    if (books.length === 0) {
      return res.status(200).json({
        success: true,
        books: [],
        message: 'No books found for this author'
      });
    }
    
    // Fetch chapters for each book to calculate stats
    const booksWithChapters = await Promise.all(books.map(async (book) => {
      const bookId = book._id.toString();
      const chapters = await chapterCollections.find({ 
        $or: [
          { bookId: bookId },
          { book_id: bookId }
        ] 
      }).toArray();
      
      return {
        ...book,
        chapters: chapters,
        chapterCount: chapters.length
      };
    }));

    res.status(200).json({
      success: true,
      books: booksWithChapters
    });
  } catch (error) {
    console.error("Get author books error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching author books',
      error: error.message
    });
  }
};

// Get a book by ID (API version)
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookCollections } = getDB();
    let objectId;
    
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format'
      });
    }
    
    const book = await bookCollections.findOne({ _id: objectId });
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      book
    });
    
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book'
    });
  }
};

// Get book by ID (legacy version)
const getBookByIdLegacy = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.findOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching book'
    });
  }
};

// Upload a new book
const uploadBook = async (req, res) => {
  try {
    const data = req.body;
    // Validate image_url
    if (!isValidUrl(data.image_url)) {
      return res.status(400).json({ success: false, message: 'Invalid image_url. Must be a valid http(s) URL.' });
    }
    const { bookCollections } = getDB();
    
    // Add chapter tracking fields
    const bookData = {
      ...data,
      totalChapters: 0,  // Will be updated as chapters are added
      hasFullText: false, // Set to true when chapters are available
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await bookCollections.insertOne(bookData);
    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully',
      bookId: result.insertedId
    });
  } catch (error) {
    console.error("Upload book error:", error);
    res.status(500).json({
      success: false,
      message: 'Error uploading book',
      error: error.message
    });
  }
};

// Update a book
const updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const updateBookData = req.body;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        ...updateBookData
      }
    };

    const options = { upsert: true };
    const result = await bookCollections.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookCollections } = getDB();
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.deleteOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBooksByAuthor,
  getBookById,
  getBookByIdLegacy,
  uploadBook,
  updateBook,
  deleteBook
};