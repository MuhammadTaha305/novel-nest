const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Create a new chapter
const createChapter = async (req, res) => {
  try {
    const { bookId, chapterNumber, title, content } = req.body;
    const { bookCollections, chapterCollection } = getDB();
    
    // Basic validation
    if (!bookId || !chapterNumber || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'BookId, chapterNumber, title, and content are required'
      });
    }
    
    // Convert string bookId to ObjectId
    let objectBookId;
    try {
      objectBookId = new ObjectId(bookId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookId format'
      });
    }
    
    // Check if book exists
    const bookExists = await bookCollections.findOne({ _id: objectBookId });
    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Check if chapter with same number already exists for this book
    const existingChapter = await chapterCollection.findOne({ 
      bookId: objectBookId, 
      chapterNumber: parseInt(chapterNumber) 
    });
    
    if (existingChapter) {
      return res.status(409).json({
        success: false,
        message: 'Chapter with this number already exists for this book'
      });
    }
    
    // Create new chapter
    const newChapter = {
      bookId: objectBookId,
      chapterNumber: parseInt(chapterNumber),
      title,
      content,
      wordCount: content.split(/\s+/).length,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await chapterCollection.insertOne(newChapter);
    
    // Update book's totalChapters count if needed
    await bookCollections.updateOne(
      { _id: objectBookId },
      { $max: { totalChapters: parseInt(chapterNumber) } }
    );
    
    res.status(201).json({
      success: true,
      chapterId: result.insertedId,
      message: 'Chapter created successfully'
    });
    
  } catch (error) {
    console.error("Create chapter error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chapter'
    });
  }
};

// Get all chapters for a book
const getChaptersByBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { chapterCollection } = getDB();
    let objectBookId;
    
    try {
      objectBookId = new ObjectId(bookId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookId format'
      });
    }
    
    // Find all chapters for this book, sorted by chapter number
    const chapters = await chapterCollection.find({ 
      bookId: objectBookId 
    }).sort({ 
      chapterNumber: 1 
    }).toArray();
    
    res.status(200).json({
      success: true,
      count: chapters.length,
      chapters: chapters.map(chapter => ({
        id: chapter._id,
        bookId: chapter.bookId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        wordCount: chapter.wordCount,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt
        // Note: We're not sending content here to save bandwidth
      }))
    });
    
  } catch (error) {
    console.error("Get chapters error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chapters'
    });
  }
};

// Get a specific chapter by ID
const getChapterById = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { chapterCollection } = getDB();
    let objectChapterId;
    
    try {
      objectChapterId = new ObjectId(chapterId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId format'
      });
    }
    
    const chapter = await chapterCollection.findOne({ _id: objectChapterId });
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    
    res.status(200).json({
      success: true,
      chapter
    });
    
  } catch (error) {
    console.error("Get chapter error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chapter'
    });
  }
};

// Get a chapter by book ID and chapter number
const getChapterByNumber = async (req, res) => {
  try {
    const { bookId, chapterNumber } = req.params;
    const { chapterCollection } = getDB();
    let objectBookId;
    
    try {
      objectBookId = new ObjectId(bookId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookId format'
      });
    }
    
    const chapter = await chapterCollection.findOne({ 
      bookId: objectBookId,
      chapterNumber: parseInt(chapterNumber)
    });
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    
    res.status(200).json({
      success: true,
      chapter
    });
    
  } catch (error) {
    console.error("Get chapter by number error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chapter'
    });
  }
};

// Update a chapter
const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const updateData = req.body;
    const { chapterCollection } = getDB();
    let objectChapterId;
    
    try {
      objectChapterId = new ObjectId(chapterId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId format'
      });
    }
    
    // Don't allow changing bookId
    if (updateData.bookId) {
      delete updateData.bookId;
    }
    
    // Calculate word count if content is being updated
    if (updateData.content) {
      updateData.wordCount = updateData.content.split(/\s+/).length;
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const result = await chapterCollection.updateOne(
      { _id: objectChapterId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully'
    });
    
  } catch (error) {
    console.error("Update chapter error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating chapter'
    });
  }
};

// Delete a chapter
const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { bookCollections, chapterCollection } = getDB();
    let objectChapterId;
    
    try {
      objectChapterId = new ObjectId(chapterId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId format'
      });
    }
    
    // Get chapter info before deletion to update book if needed
    const chapter = await chapterCollection.findOne({ _id: objectChapterId });
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }
    
    const result = await chapterCollection.deleteOne({ _id: objectChapterId });
    
    // Update book's totalChapters if this was the highest chapter
    const highestRemainingChapter = await chapterCollection.find({ 
      bookId: chapter.bookId 
    }).sort({ 
      chapterNumber: -1 
    }).limit(1).toArray();
    
    if (highestRemainingChapter.length > 0) {
      await bookCollections.updateOne(
        { _id: chapter.bookId },
        { $set: { totalChapters: highestRemainingChapter[0].chapterNumber } }
      );
    } else {
      // No chapters left for this book
      await bookCollections.updateOne(
        { _id: chapter.bookId },
        { $set: { totalChapters: 0 } }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully'
    });
    
  } catch (error) {
    console.error("Delete chapter error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chapter'
    });
  }
};

// Bulk upload chapters
const bulkUploadChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { chapters } = req.body;
    const { bookCollections, chapterCollection } = getDB();
    
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chapters array is required and must not be empty'
      });
    }
    
    let objectBookId;
    try {
      objectBookId = new ObjectId(bookId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookId format'
      });
    }
    
    // Check if book exists
    const bookExists = await bookCollections.findOne({ _id: objectBookId });
    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Process and validate each chapter
    const chaptersToInsert = [];
    const chapterNumbers = new Set();
    let highestChapterNumber = 0;
    
    for (const chapter of chapters) {
      if (!chapter.chapterNumber || !chapter.title || !chapter.content) {
        return res.status(400).json({
          success: false,
          message: 'Each chapter must have chapterNumber, title, and content'
        });
      }
      
      const chapterNumber = parseInt(chapter.chapterNumber);
      
      // Check for duplicate chapter numbers
      if (chapterNumbers.has(chapterNumber)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate chapter number: ${chapterNumber}`
        });
      }
      
      chapterNumbers.add(chapterNumber);
      highestChapterNumber = Math.max(highestChapterNumber, chapterNumber);
      
      chaptersToInsert.push({
        bookId: objectBookId,
        chapterNumber,
        title: chapter.title,
        content: chapter.content,
        wordCount: chapter.content.split(/\s+/).length,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Check for existing chapters with same numbers
    const existingChapters = await chapterCollection.find({
      bookId: objectBookId,
      chapterNumber: { $in: Array.from(chapterNumbers) }
    }).toArray();
    
    if (existingChapters.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Some chapters already exist: ${existingChapters.map(c => c.chapterNumber).join(', ')}`
      });
    }
    
    // Insert all chapters
    const result = await chapterCollection.insertMany(chaptersToInsert);
    
    // Update book's totalChapters if needed
    await bookCollections.updateOne(
      { _id: objectBookId },
      { $max: { totalChapters: highestChapterNumber } }
    );
    
    res.status(201).json({
      success: true,
      insertedCount: result.insertedCount,
      message: 'Chapters uploaded successfully'
    });
    
  } catch (error) {
    console.error("Bulk upload chapters error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading chapters'
    });
  }
};

// Legacy upload chapter
const uploadChapterLegacy = async (req, res) => {
  try {
    const { chapterCollection } = getDB();
    const chapter = {
      ...req.body,
      bookId: new ObjectId(req.body.bookId),
      wordCount: req.body.content.split(/\s+/).length,
      createdAt: new Date()
    };
    const result = await chapterCollection.insertOne(chapter);
    res.status(201).json({ message: 'Chapter uploaded successfully', chapter: { ...chapter, _id: result.insertedId } });
  } catch (error) {
    res.status(400).json({ message: 'Error uploading chapter', error: error.message });
  }
};

// Legacy get all chapters for a book
const getChaptersLegacy = async (req, res) => {
  try {
    const { chapterCollection } = getDB();
    const chapters = await chapterCollection.find({ bookId: new ObjectId(req.params.bookId) })
      .sort({ chapterNumber: 1 })
      .toArray();
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error: error.message });
  }
};

// Legacy get chapter by book ID and chapter number
const getChapterByNumberLegacy = async (req, res) => {
  try {
    const { chapterCollection } = getDB();
    const bookId = req.params.id;
    const chapterNumber = parseInt(req.params.number);
    
    const chapter = await chapterCollection.findOne({
      bookId: new ObjectId(bookId),
      chapterNumber: chapterNumber
    });
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapter', error: error.message });
  }
};

module.exports = {
  createChapter,
  getChaptersByBookId,
  getChapterById,
  getChapterByNumber,
  updateChapter,
  deleteChapter,
  bulkUploadChapters,
  // Legacy functions
  uploadChapterLegacy,
  getChaptersLegacy,
  getChapterByNumberLegacy
};