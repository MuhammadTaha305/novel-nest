const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const userHistoryController = require('../controllers/userHistoryController');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const userLoginsController = require('../controllers/userLoginsController');
const adminStatsController = require('../controllers/adminStatsController');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { usersCollection } = getDB();
    const imageUrl = `/uploads/${req.file.filename}`;
    const imagePath = path.join(__dirname, '../../public/uploads', req.file.filename);
    const imageBuffer = fs.readFileSync(imagePath);

    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          profilePic: imageUrl,
          profilePicData: imageBuffer, // Store the image as a Buffer in MongoDB
          profilePicType: req.file.mimetype // Store the mimetype for serving
        }
      }
    );

    res.json({
      success: true,
      profilePic: imageUrl
    });
  } catch (error) {
    console.error('Profile pic upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile picture' });
  }
});

// Serve profile picture from DB as image
router.get('/profile-pic/:userId', async (req, res) => {
  try {
    const { usersCollection } = getDB();
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.userId) });
    if (!user || !user.profilePicData) {
      return res.status(404).send('No profile picture found');
    }
    res.set('Content-Type', user.profilePicType || 'image/jpeg');
    res.send(user.profilePicData.buffer || user.profilePicData);
  } catch (error) {
    res.status(500).send('Error retrieving profile picture');
  }
});

// User reading history/progress
router.post('/history', auth, userHistoryController.logReadingProgress);
router.get('/history', auth, userHistoryController.getUserHistory);

// User login analytics for admin dashboard
router.get('/user-logins', auth, userLoginsController.getUserLogins);

// Admin analytics: total chapters read by all users per day
router.get('/admin/chapters-read', auth, adminStatsController.getChaptersReadByDate);

// Admin analytics: number of books uploaded by admin per day
router.get('/admin/books-uploaded', auth, adminStatsController.getBooksUploadedByDate);

module.exports = router;
