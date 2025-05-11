const QuizAttempt = require("../models/quizAttemptModel");
const Question = require("../models/questionModels");
const User = require('../models/userModels')

// Start an attempt
exports.startAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.create({
      user: req.body.user,
      quiz: req.body.quiz,
      start_time: new Date(),
      status: "in_progress"
    });

    res.status(201).json({
      status: "success",
      data: { attempt },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Submit an attempt

exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId, questions } = req.body;

    // Find the attempt first and populate quiz
    const existingAttempt = await QuizAttempt.findById(attemptId).populate('quiz');
    if (!existingAttempt) {
      return res.status(404).json({ status: 'fail', message: 'Attempt not found' });
    }

    const quiz = existingAttempt.quiz;
    const startTime = new Date(existingAttempt.start_time);
    const timeTakenInSeconds = (Date.now() - startTime.getTime()) / 1000;

    const questionsToEvaluate = questions && questions.length > 0
      ? questions
      : existingAttempt.questions.map(q => ({
          question_id: q.question_id,
          selected_answer: q.selected_answer
        }));

    let score = 0;
    let maxScore = 0;
    const evaluatedQuestions = [];

    for (let q of questionsToEvaluate) {
      const questionId = typeof q.question_id === 'string' ? q.question_id : q.question_id.toString();
      const dbQuestion = await Question.findById(questionId);
      if (!dbQuestion) continue;

      const isCorrect =
        dbQuestion.question_type === "MCQ"
          ? dbQuestion.correct_answer === q.selected_answer
          : dbQuestion.correct_answer.toLowerCase().trim() === q.selected_answer.toLowerCase().trim();

      const questionPoints = dbQuestion.points || 1;
      maxScore += questionPoints;

      if (isCorrect) score += questionPoints;

      evaluatedQuestions.push({
        question_id: dbQuestion._id,
        selected_answer: q.selected_answer,
        is_correct: isCorrect,
        answered_at: new Date(),
      });
    }

    const percentage = (score / maxScore) * 100;

    // ✅ Award only the first badge that matches the condition
    let earnedBadge = null;
    if (quiz.badges && Array.isArray(quiz.badges)) {
      for (let badge of quiz.badges) {
        if (percentage >= parseFloat(badge.condition)) {
          earnedBadge = {
            media: badge.media,
            condition: badge.condition,
            awarded_at: new Date(),
          };
          break;
        }
      }
    }

    const attempt = await QuizAttempt.findByIdAndUpdate(
      attemptId,
      {
        status: "submitted",
        end_time: new Date(),
        time_taken: timeTakenInSeconds,
        score,
        questions: evaluatedQuestions,
        earned_badges: earnedBadge ? [earnedBadge] : []
      },
      { new: true }
    ).populate("questions.question_id quiz user");

    res.status(200).json({
      status: "success",
      data: { attempt },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: "fail", message: err.message });
  }
};


// Get attempts for a user
exports.getAttemptsByUser = async (req, res) => {
  try {
    // Get the user ID from the request params
    const { userId } = req.params;

    // Fetch all attempts for the user, populate quiz and earned badges
    const attempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title description')  // Populating quiz info (title, description)
      .sort({ start_time: -1 });  // Sort by most recent attempt first

    // Initialize total points and highest badge variables
    let totalPoints = 0;
    let highestBadge = null;

    // Iterate through each attempt and calculate total points and highest badge
    attempts.forEach((attempt) => {
      totalPoints += attempt.score;  // Accumulate total score points

      // If this attempt has earned badges, check for the highest one
      if (attempt.earned_badges.length > 0) {
        const badge = attempt.earned_badges[0]; // Get the first badge (you can change the logic based on your needs)
        if (!highestBadge || parseFloat(badge.condition) > parseFloat(highestBadge.condition)) {
          highestBadge = badge;  // Set the highest badge based on condition
        }
      }
    });

    res.status(200).json({
      status: 'success',
      totalPoints,
      highestBadge, // Return the highest badge
      data: {
        attempts,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update attempts per question
exports.answerQuestion = async (req, res) => {
  try {
    const { question_id, selected_answer } = req.body;
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw new Error("Quiz attempt not found");
    if (attempt.status === "submitted") {
      return res
        .status(400)
        .json({ status: "fail", message: "This attempt is already submitted" });
    }

    const question = await Question.findById(question_id);
    if (!question) throw new Error("Question not found");

    const isCorrect =
      question.question_type === "MCQ"
        ? question.correct_answer === selected_answer
        : question.correct_answer.toLowerCase().trim() ===
          selected_answer.toLowerCase().trim();

    // Check if already answered
    const existingIndex = attempt.questions.findIndex((q) =>
      q.question_id.equals(question_id)
    );

    if (existingIndex >= 0) {
      // Update existing answer
      attempt.questions[existingIndex] = {
        question_id,
        selected_answer,
        is_correct: isCorrect,
        answered_at: new Date(),
      };
    } else {
      // Add new answer
      attempt.questions.push({
        question_id,
        selected_answer,
        is_correct: isCorrect,
        answered_at: new Date(),
      });
    }

    // Recalculate score - We need to get ALL questions and points
    let calculatedScore = 0;
    for (let q of attempt.questions) {
      if (q.is_correct) {
        // Look up the question to get its points
        const questionDoc = await Question.findById(q.question_id);
        if (questionDoc) {
          calculatedScore += questionDoc.points || 1; // Default to 1 point if not specified
        } else {
          // Question might have been deleted
          calculatedScore += 1; // Default to 1 point
        }
      }
    }
    
    attempt.score = calculatedScore;
    await attempt.save();

    res.status(200).json({
      status: "success",
      message: "Question saved successfully",
      data: {
        is_correct: isCorrect,
        score: attempt.score,
        answered_questions: attempt.questions.length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Get a single attempt by ID
exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz')
      .populate('questions.question_id');
      
    if (!attempt) {
      return res.status(404).json({
        status: "fail",
        message: "No attempt found with that ID"
      });
    }
    
    res.status(200).json({
      status: "success",
      data: { attempt }
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};


// Controller to fetch quiz attempts
exports.getAttemptsByUser = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.params.userId })
      .populate('quiz', 'title description') // Populate quiz details
      .sort({ start_time: -1 });

    // Calculate total points from all attempts
    const totalPoints = attempts.reduce((total, attempt) => total + attempt.score, 0);

    res.status(200).json({
      status: "success",
      results: attempts.length,
      totalPoints,
      data: { attempts },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};


exports.getLeaderboard = async (req, res) => {
  try {
    // Step 1: Fetch all users
    const users = await User.find();  // Assuming you have a User model

    // Step 2: Calculate the total score for each user
    const leaderboard = [];

    for (const user of users) {
      // Step 2a: Find all the quiz attempts for the user
      const attempts = await QuizAttempt.find({ user: user._id, status: 'submitted' });  // Only consider completed attempts

      let totalScore = 0;
      // Step 2b: Sum the scores from each attempt
      attempts.forEach((attempt) => {
        totalScore += attempt.score; // Add score for each quiz attempt
      });

      // Step 2c: Add user data to the leaderboard array
      leaderboard.push({
        userId: user._id,
        name: user.name,
        totalScore: totalScore,
      });
    }

    // Step 3: Sort leaderboard by total score (descending)
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Step 4: Return the leaderboard data
    res.status(200).json({
      status: 'success',
      data: {
        leaderboard,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};