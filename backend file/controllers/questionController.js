const Question = require('../models/questionModels');

exports.createQuestion = async (req, res) => {
  try {
    const questionData = { ...req.body };

    // If a file is uploaded, set media_url
    if (req.file) {
      questionData.media_url = req.file.path;
    }

    const question = await Question.create(questionData);
    res.status(201).json({
      status: 'success',
      data: { question }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Optionally, update method too:
exports.updateQuestion = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.media_url = req.file.path;
    }

    const question = await Question.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!question) throw new Error('Question not found');

    res.status(200).json({ status: 'success', data: { question } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Get all questions for a quiz
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quiz: req.params.quizId });
    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: { questions }
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// Get a single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) throw new Error('Question not found');
    res.status(200).json({ status: 'success', data: { question } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// Update a question
// exports.updateQuestion = async (req, res) => {
//   try {
//     const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });
//     if (!question) throw new Error('Question not found');
//     res.status(200).json({ status: 'success', data: { question } });
//   } catch (err) {
//     res.status(400).json({ status: 'fail', message: err.message });
//   }
// };

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) throw new Error('Question not found');
    res.status(200).json({ status: 'success', data: { question } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};
