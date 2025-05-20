const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

// API chapter routes
router.post('/', chapterController.createChapter);
router.get('/:chapterId', chapterController.getChapterById);
router.patch('/:chapterId', chapterController.updateChapter);
router.delete('/:chapterId', chapterController.deleteChapter);

// Legacy chapter routes
router.get('/legacy/books/:bookId', chapterController.getChaptersLegacy);
router.get('/legacy/books/:id/chapter/:number', chapterController.getChapterByNumberLegacy);
router.post('/legacy', chapterController.uploadChapterLegacy);

module.exports = router;