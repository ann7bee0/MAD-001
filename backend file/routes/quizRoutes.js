const express = require('express');
const quizController = require('../controllers/quizController');
const upload = require('../utils/multer');

const router = express.Router();

// POST quiz with badge image upload
router
  .route('/')
  .post(upload.array('badges', 5), quizController.createQuiz);

// GET all quizzes
router
  .route('/all')
  .get(quizController.getAllQuizzes);

// GET, PATCH (with badge upload), DELETE by ID
router
  .route('/:id')
  .get(quizController.getQuizById)
  .patch(upload.array('badges', 5), quizController.updateQuiz)
  .delete(quizController.deleteQuiz);

module.exports = router;
