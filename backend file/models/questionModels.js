const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false } // only used for MCQ
});

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  question_text: { type: String, required: true },
  question_type: {
    type: String,
    enum: ['MCQ', 'true_false', 'fill_in_the_blank'],
    required: true
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 1 },
  media_url: { type: String }, // optional image/video

  options: [optionSchema], // only used for MCQ
  correct_answer: { type: String, required: true } // used for true_false & fill_in_the_blank
});

questionSchema.pre(/^find/, function (next) {
  this.populate({ path: 'quiz', select: 'title' });
  next();
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;