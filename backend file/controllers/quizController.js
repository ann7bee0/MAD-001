const Quiz = require('../models/quizModels');

// GET all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: { quizzes }
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// GET quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) throw new Error('Quiz not found');
    res.status(200).json({ status: 'success', data: { quiz } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// CREATE quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title, description, category, tags, rules,
      start, end, duration, max_attempts,
      questions_count, is_active, user
    } = req.body;
    console.log(req.body)
    const badges = req.files?.map(file => ({
      media: file.path,
      condition: req.body[`condition_${file.originalname}`] || ''
    })) || [];

    const quiz = await Quiz.create({
      title, description, category, tags, rules,
      start, end, duration, max_attempts,
      questions_count, is_active, user, badges
    });

    res.status(201).json({
      status: 'success',
      data: { quiz }
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// UPDATE quiz by ID
exports.updateQuiz = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      updates.badges = req.files.map(file => ({
        media: file.path,
        condition: req.body[`condition_${file.originalname}`] || ''
      }));
    }

    const quiz = await Quiz.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!quiz) throw new Error('Quiz not found');

    res.status(200).json({
      status: 'success',
      data: { quiz }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// DELETE quiz by ID
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) throw new Error('Quiz not found');
    res.status(200).json({ status: 'success', data: { quiz } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};
