const express = require('express');
const quizAttemptController = require('../controllers/quizAttemptController');
const router = express.Router();

router
  .route('/start')
  .post(quizAttemptController.startAttempt); // POST with quiz + user ID

router
  .route('/submit')
  .post(quizAttemptController.submitAttempt); // POST with answers + attemptId

router
  .route('/user/:userId')
  .get(quizAttemptController.getAttemptsByUser); // GET all attempts by a user

router
  .route('/:attemptId/question')
  .patch(quizAttemptController.answerQuestion);

router.get('/leaderboard', quizAttemptController.getLeaderboard);

module.exports = router;