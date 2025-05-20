// Controller for user reading history and progress
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Log or update user reading progress
const logReadingProgress = async (req, res) => {
  try {
    const { bookId, chapterNumber, percentComplete } = req.body;
    const userId = req.user.id;
    const { userHistoryCollection } = getDB();

    if (!bookId || !chapterNumber) {
      return res.status(400).json({ success: false, message: 'bookId and chapterNumber required' });
    }

    // Upsert user reading progress
    await userHistoryCollection.updateOne(
      { userId: new ObjectId(userId), bookId: new ObjectId(bookId) },
      {
        $set: {
          lastChapterRead: chapterNumber,
          percentComplete: percentComplete || 0,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging progress', error: error.message });
  }
};

// Get user reading history
const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userHistoryCollection } = getDB();
    const history = await userHistoryCollection.find({ userId: new ObjectId(userId) }).toArray();
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
};

module.exports = { logReadingProgress, getUserHistory };
