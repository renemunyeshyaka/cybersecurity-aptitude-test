const pool = require('../config/database');

class Test {
  static async create(participantId) {
    const query = `
      INSERT INTO tests (participant_id, status) 
      VALUES ($1, 'in_progress') 
      RETURNING *
    `;
    const result = await pool.query(query, [participantId]);
    return result.rows[0];
  }

  static async update(testId, data) {
    const { end_time, duration, status, score, category_scores } = data;
    const query = `
      UPDATE tests 
      SET end_time = $1, duration = $2, status = $3, score = $4, category_scores = $5
      WHERE id = $6 
      RETURNING *
    `;
    const result = await pool.query(query, [
      end_time, duration, status, score, category_scores, testId
    ]);
    return result.rows[0];
  }

  static async findById(testId) {
    const query = 'SELECT * FROM tests WHERE id = $1';
    const result = await pool.query(query, [testId]);
    return result.rows[0];
  }

  static async getParticipantTests(participantId) {
    const query = `
      SELECT t.*, p.email, p.full_name 
      FROM tests t
      JOIN participants p ON t.participant_id = p.id
      WHERE t.participant_id = $1 
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [participantId]);
    return result.rows;
  }

  static async getAllTests(filters = {}) {
    let query = `
      SELECT t.*, p.email, p.full_name, p.institution 
      FROM tests t
      JOIN participants p ON t.participant_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getTestWithDetails(testId) {
    const testQuery = `
      SELECT t.*, p.email, p.full_name, p.institution 
      FROM tests t
      JOIN participants p ON t.participant_id = p.id
      WHERE t.id = $1
    `;
    
    const answersQuery = `
      SELECT a.*, q.question_text, q.category, q.options, q.correct_answer, q.points
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.test_id = $1
      ORDER BY a.created_at
    `;

    const testResult = await pool.query(testQuery, [testId]);
    const answersResult = await pool.query(answersQuery, [testId]);

    return {
      test: testResult.rows[0],
      answers: answersResult.rows
    };
  }
}

module.exports = Test;