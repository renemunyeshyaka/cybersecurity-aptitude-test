const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Test = require('../models/Test');
const Participant = require('../models/Participant');
const Question = require('../models/Question');

class AdminController {
  static async getAllParticipants(req, res) {
    try {
      const participants = await Participant.getAll();
      res.status(200).json(participants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  }

  static async getAllTests(req, res) {
    try {
      const { status, startDate, endDate } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const tests = await Test.getAllTests(filters);
      res.status(200).json(tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ error: 'Failed to fetch tests' });
    }
  }

  static async exportToExcel(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const filters = {};
      
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const tests = await Test.getAllTests(filters);

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Test Results');

      // Define columns
      worksheet.columns = [
        { header: 'Participant Email', key: 'email', width: 30 },
        { header: 'Full Name', key: 'full_name', width: 25 },
        { header: 'Institution', key: 'institution', width: 25 },
        { header: 'Test Date', key: 'test_date', width: 20 },
        { header: 'Duration (seconds)', key: 'duration', width: 15 },
        { header: 'Score (%)', key: 'score', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Test ID', key: 'test_id', width: 36 }
      ];

      // Add rows
      tests.forEach(test => {
        worksheet.addRow({
          email: test.email,
          full_name: test.full_name,
          institution: test.institution,
          test_date: new Date(test.start_time).toLocaleString(),
          duration: test.duration || 'N/A',
          score: test.score || '0.00',
          status: test.status,
          test_id: test.id
        });
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=test_results.xlsx');

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  }

  static async exportToPDF(req, res) {
    try {
      const { testId } = req.params;
      const testDetails = await Test.getTestWithDetails(testId);

      if (!testDetails.test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=test_${testId}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      // Add content
      doc.fontSize(20).text('Cybersecurity Aptitude Test Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Participant: ${testDetails.test.full_name}`);
      doc.text(`Email: ${testDetails.test.email}`);
      doc.text(`Institution: ${testDetails.test.institution || 'N/A'}`);
      doc.text(`Test Date: ${new Date(testDetails.test.start_time).toLocaleString()}`);
      doc.text(`Duration: ${testDetails.test.duration || 0} seconds`);
      doc.text(`Score: ${testDetails.test.score || '0.00'}%`);
      doc.text(`Status: ${testDetails.test.status}`);
      doc.moveDown();

      doc.fontSize(16).text('Detailed Answers:');
      doc.moveDown();

      // Add answers
      testDetails.answers.forEach((answer, index) => {
        doc.fontSize(12).text(`${index + 1}. ${answer.question_text}`);
        doc.fontSize(10).text(`Category: ${answer.category}`);
        doc.text(`Selected: ${answer.selected_option || 'No answer'}`);
        doc.text(`Correct: ${answer.correct_answer}`);
        doc.text(`Status: ${answer.is_correct ? '✓ Correct' : '✗ Incorrect'}`);
        doc.moveDown(0.5);
      });

      // Add summary
      doc.moveDown();
      doc.fontSize(14).text('Summary:', { underline: true });
      
      const categories = {};
      testDetails.answers.forEach(answer => {
        if (!categories[answer.category]) {
          categories[answer.category] = { correct: 0, total: 0 };
        }
        categories[answer.category].total++;
        if (answer.is_correct) {
          categories[answer.category].correct++;
        }
      });

      Object.entries(categories).forEach(([category, stats]) => {
        const percentage = (stats.correct / stats.total * 100).toFixed(1);
        doc.fontSize(12).text(`${category}: ${stats.correct}/${stats.total} (${percentage}%)`);
      });

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const client = await pool.connect();
      
      // Get total participants
      const participantsResult = await client.query('SELECT COUNT(*) FROM participants');
      
      // Get total tests
      const testsResult = await client.query('SELECT COUNT(*) FROM tests');
      
      // Get completed tests
      const completedResult = await client.query("SELECT COUNT(*) FROM tests WHERE status = 'completed'");
      
      // Get average score
      const avgScoreResult = await client.query(
        "SELECT AVG(score) FROM tests WHERE status = 'completed' AND score IS NOT NULL"
      );
      
      // Get tests by category scores
      const categoryStatsResult = await client.query(`
        SELECT 
          category,
          COUNT(*) as total_questions,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        GROUP BY q.category
        ORDER BY q.category
      `);

      client.release();

      const stats = {
        totalParticipants: parseInt(participantsResult.rows[0].count),
        totalTests: parseInt(testsResult.rows[0].count),
        completedTests: parseInt(completedResult.rows[0].count),
        averageScore: parseFloat(avgScoreResult.rows[0].avg) || 0,
        categoryStats: categoryStatsResult.rows.map(row => ({
          category: row.category,
          totalQuestions: parseInt(row.total_questions),
          correctAnswers: parseInt(row.correct_answers),
          percentage: ((parseInt(row.correct_answers) / parseInt(row.total_questions)) * 100).toFixed(1)
        }))
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
}

module.exports = AdminController;