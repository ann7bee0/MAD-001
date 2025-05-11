const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selected_answer: { type: String, required: true },
  is_correct: { type: Boolean, default: false }
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
  current_question_index: {type: Number},     // 👈 new: track position
  status: {
    type: String,
    enum: ['in_progress', 'submitted'],
    default: 'in_progress'
  },
  score: { type: Number, default: 0 },
  time_taken: { type: Number }, // in seconds
  questions: [answerSchema],
  earned_badges: [  {
    media: { type: String, required: true },        // Badge image path
    condition: { type: String, required: true },    // e.g. "80"
    awarded_at: { type: Date, default: Date.now }   // Timestamp of achievement
  }]
});

quizAttemptSchema.pre(/^find/, function (next) {
  this.populate('quiz').populate('user');
  next();
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;