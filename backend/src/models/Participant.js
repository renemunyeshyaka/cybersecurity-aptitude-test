const pool = require('../config/database');

class Participant {
  static async findByEmail(email) {
    const query = 'SELECT * FROM participants WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async create(email, fullName, institution) {
    const query = `
      INSERT INTO participants (email, full_name, institution) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pool.query(query, [email, fullName, institution]);
    return result.rows[0];
  }

  static async updateTestStats(participantId) {
    const query = `
      UPDATE participants 
      SET total_tests_taken = total_tests_taken + 1, 
          last_test_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [participantId]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT id, email, full_name, institution, 
             registration_date, last_test_date, total_tests_taken
      FROM participants 
      ORDER BY registration_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Participant;