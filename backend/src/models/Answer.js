const pool = require('../config/database');

class Answer {
  static async submitAnswer(testId, questionId, selectedOption, timeTaken, isCorrect) {
    const query = `
      INSERT INTO answers (test_id, question_id, selected_option, time_taken, is_correct)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [testId, questionId, selectedOption, timeTaken, isCorrect]);
    return result.rows[0];
  }

  static async getTestAnswers(testId) {
    const query = `
      SELECT a.*, q.question_text, q.category, q.correct_answer, q.points
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.test_id = $1
    `;
    const result = await pool.query(query, [testId]);
    return result.rows;
  }

  static async bulkSubmitAnswers(answers) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const submittedAnswers = [];
      for (const answer of answers) {
        const { test_id, question_id, selected_option, time_taken, is_correct } = answer;
        const query = `
          INSERT INTO answers (test_id, question_id, selected_option, time_taken, is_correct)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const result = await client.query(query, [
          test_id, question_id, selected_option, time_taken, is_correct
        ]);
        submittedAnswers.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return submittedAnswers;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Answer;