const { query } = require('../config/db');

// Loan model class
class Loan {
  constructor(loanData) {
    this.id_loan = loanData.id_loan;
    this.user_id = loanData.user_id;
    this.amount = loanData.amount;
    this.status = loanData.status || 'pending';
    this.request_date = loanData.request_date || new Date();
  }

  // Create a new loan request
  static async create(loanData) {
    // Check if user exists
    const userExistsQuery = 'SELECT id_user FROM users WHERE id_user = ? LIMIT 1';
    const userExists = await query(userExistsQuery, [loanData.user_id]);
    
    if (userExists.length === 0) {
      throw new Error('User does not exist');
    }

    // Validate amount
    if (!loanData.amount || isNaN(parseFloat(loanData.amount)) || parseFloat(loanData.amount) <= 0) {
      throw new Error('Invalid loan amount');
    }

    // Insert loan into database
    const sql = 'INSERT INTO loans (user_id, amount, status) VALUES (?, ?, ?)';
    const params = [
      loanData.user_id,
      parseFloat(loanData.amount),
      loanData.status || 'pending'
    ];

    const result = await query(sql, params);

    // Return the newly created loan record with its ID
    return {
      id_loan: result.insertId,
      user_id: loanData.user_id,
      amount: parseFloat(loanData.amount),
      status: loanData.status || 'pending',
      request_date: new Date()
    };
  }

  // Get all loans with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT l.*, u.name, u.phoneNumber 
      FROM loans l
      JOIN users u ON l.user_id = u.id_user
      ORDER BY l.request_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const loans = await query(sql, [limit, offset]);
    return loans;
  }

  // Get loans by user ID
  static async findByUserId(user_id) {
    const sql = `
      SELECT * FROM loans 
      WHERE user_id = ?
      ORDER BY request_date DESC
    `;
    
    const loans = await query(sql, [user_id]);
    return loans;
  }

  // Get loan by ID
  static async findById(id_loan) {
    const sql = `
      SELECT l.*, u.name, u.phoneNumber 
      FROM loans l
      JOIN users u ON l.user_id = u.id_user
      WHERE l.id_loan = ?
      LIMIT 1
    `;
    
    const loans = await query(sql, [id_loan]);
    return loans.length > 0 ? loans[0] : null;
  }

  // Update loan status
  static async updateStatus(id_loan, status) {
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be pending, approved, or rejected');
    }

    const sql = 'UPDATE loans SET status = ? WHERE id_loan = ?';
    const result = await query(sql, [status, id_loan]);

    return {
      modifiedCount: result.affectedRows,
      status: status
    };
  }

  // Get total amount of loans by status
  static async getTotalByStatus(status = null) {
    let sql = 'SELECT SUM(amount) as total FROM loans';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    const result = await query(sql, params);
    return result[0].total || 0;
  }

  // Get loans count by status
  static async getCountByStatus(status = null) {
    let sql = 'SELECT COUNT(*) as count FROM loans';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    const result = await query(sql, params);
    return result[0].count || 0;
  }

  // Delete a loan (only if pending)
  static async delete(id_loan) {
    // Check if loan is pending before deleting
    const loan = await this.findById(id_loan);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status !== 'pending') {
      throw new Error('Cannot delete a loan that is not pending');
    }

    const sql = 'DELETE FROM loans WHERE id_loan = ?';
    const result = await query(sql, [id_loan]);

    return {
      deletedCount: result.affectedRows
    };
  }
}

module.exports = Loan;
