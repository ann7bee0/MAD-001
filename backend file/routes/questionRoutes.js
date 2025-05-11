const express = require('express');
const questionController = require('../controllers/questionController');
const upload = require('../utils/multer');

const router = express.Router();

router
  .route('/')
  .post(upload.single('media'), questionController.createQuestion);

router
  .route('/:id')
  .get(questionController.getQuestion)
  .patch(upload.single('media'), questionController.updateQuestion)
  .delete(questionController.deleteQuestion);

router
  .route('/quiz/:quizId')
  .get(questionController.getQuestionsByQuiz);

module.exports = router;
