const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  media: { type: String, required: true },         // URL or path to badge icon/image
  condition: { type: String, required: true }      // e.g., "Score above 80%"
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: [{ type: String, trim: true }],        // multiple categories allowed
  tags: [{ type: String, trim: true }],            // for filtering and SEO
  rules: [{ type: String, trim: true }],           // list of quiz rules
  badges: [badgeSchema],                           // list of earned rewards with conditions
  questions_count: { type: Number, default: 0 },   // total questions in the quiz

  start: { type: Date },                           // quiz start time
  end: { type: Date },                             // quiz end time
  duration: { type: Number },                      // time allowed (in minutes)
  max_attempts: { type: Number, default: 1 },      // max tries per user

  is_active: { type: Boolean, default: true },     // if quiz is visible/running
  created_at: { type: Date, default: Date.now },   // auto timestamp

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quiz must be created by a User.'],
    index: true
  }
});

quizSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name email' });
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
