const pool = require('../config/database');

class Question {
  static async getByCategory(category, limit = 10) {
    const query = `
      SELECT id, question_text, category, difficulty, options, points
      FROM questions 
      WHERE category = $1 AND active = true 
      ORDER BY RANDOM() 
      LIMIT $2
    `;
    const result = await pool.query(query, [category, limit]);
    return result.rows;
  }

  static async getById(questionId) {
    const query = 'SELECT * FROM questions WHERE id = $1';
    const result = await pool.query(query, [questionId]);
    return result.rows[0];
  }

  static async getAllCategories() {
    const query = 'SELECT DISTINCT category FROM questions WHERE active = true';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getAll() {
    const query = 'SELECT * FROM questions WHERE active = true ORDER BY category, difficulty';
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(questionData) {
    const { question_text, category, difficulty, options, correct_answer, explanation, points } = questionData;
    const query = `
      INSERT INTO questions 
      (question_text, category, difficulty, options, correct_answer, explanation, points)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      question_text, category, difficulty, options, correct_answer, explanation, points
    ]);
    return result.rows[0];
  }
}

module.exports = Question;