const Test = require('../models/Test');
const Participant = require('../models/Participant');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

class TestController {
  static async startTest(req, res) {
    try {
      const { email, fullName, institution } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if participant exists or create new
      let participant = await Participant.findByEmail(email);
      if (!participant) {
        if (!fullName) {
          return res.status(400).json({ error: 'Full name is required for new participants' });
        }
        participant = await Participant.create(email, fullName, institution);
      }

      // Create new test
      const test = await Test.create(participant.id);

      // Get questions for the test
      const categories = await Question.getAllCategories();
      const questions = [];

      // Get 5 questions from each category (adjust as needed)
      for (const category of categories) {
        const categoryQuestions = await Question.getByCategory(category, 5);
        questions.push(...categoryQuestions);
      }

      // Shuffle questions
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

      res.status(201).json({
        message: 'Test started successfully',
        testId: test.id,
        participantId: participant.id,
        questions: shuffledQuestions,
        maxDuration: process.env.MAX_TEST_DURATION || 1800
      });
    } catch (error) {
      console.error('Error starting test:', error);
      res.status(500).json({ error: 'Failed to start test' });
    }
  }

  static async submitTest(req, res) {
    try {
      const { testId, answers } = req.body;

      if (!testId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid submission data' });
      }

      // Get test details
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      if (test.status === 'completed') {
        return res.status(400).json({ error: 'Test already submitted' });
      }

      // Process answers and calculate score
      let totalScore = 0;
      let categoryScores = {};
      const submittedAnswers = [];

      for (const answer of answers) {
        const { questionId, selectedOption, timeTaken } = answer;
        
        // Get question details
        const question = await Question.getById(questionId);
        if (!question) continue;

        const isCorrect = selectedOption === question.correct_answer;
        const points = isCorrect ? question.points : 0;
        
        // Update category scores
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = { correct: 0, total: 0, points: 0 };
        }
        categoryScores[question.category].total++;
        if (isCorrect) {
          categoryScores[question.category].correct++;
          categoryScores[question.category].points += points;
          totalScore += points;
        }

        // Prepare answer for bulk submission
        submittedAnswers.push({
          test_id: testId,
          question_id: questionId,
          selected_option: selectedOption,
          time_taken: timeTaken,
          is_correct: isCorrect
        });
      }

      // Submit all answers
      await Answer.bulkSubmitAnswers(submittedAnswers);

      // Calculate percentage score
      const totalQuestions = answers.length;
      const percentageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

      // Update test record
      const endTime = new Date();
      const startTime = new Date(test.start_time);
      const duration = Math.floor((endTime - startTime) / 1000);

      const updatedTest = await Test.update(testId, {
        end_time: endTime,
        duration: duration,
        status: 'completed',
        score: percentageScore,
        category_scores: categoryScores
      });

      // Update participant's test count
      await Participant.updateTestStats(test.participant_id);

      res.status(200).json({
        message: 'Test submitted successfully',
        score: percentageScore,
        totalQuestions: totalQuestions,
        correctAnswers: Object.values(categoryScores).reduce((sum, cat) => sum + cat.correct, 0),
        categoryScores: categoryScores,
        duration: duration
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      res.status(500).json({ error: 'Failed to submit test' });
    }
  }

  static async getTestDetails(req, res) {
    try {
      const { testId } = req.params;
      const testDetails = await Test.getTestWithDetails(testId);

      if (!testDetails.test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.status(200).json(testDetails);
    } catch (error) {
      console.error('Error fetching test details:', error);
      res.status(500).json({ error: 'Failed to fetch test details' });
    }
  }
}

module.exports = TestController;