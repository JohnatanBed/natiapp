const { query } = require('../config/db');

class Amount {
  constructor(amountData) {
    this.id_amount = amountData.id_amount;
    this.user_id = amountData.user_id;
    this.money = amountData.money;
    this.registeredAt = amountData.registeredAt || new Date();
  }

  static async create(amountData) {
    const userExistsQuery = 'SELECT id_user FROM users WHERE id_user = ? LIMIT 1';
    const userExists = await query(userExistsQuery, [amountData.user_id]);
    
    if (userExists.length === 0) {
      throw new Error('User does not exist');
    }

    const sql = 'INSERT INTO amounts (user_id, money) VALUES (?, ?) RETURNING *';
    const params = [amountData.user_id, amountData.money];

    const result = await query(sql, params);
    const newAmount = result[0];

    return {
      id_amount: newAmount.id_amount,
      user_id: newAmount.user_id,
      money: newAmount.money,
      registeredAt: newAmount.registeredat
    };
  }

  static async findById(id_amount) {
    const sql = 'SELECT * FROM amounts WHERE id_amount = ? LIMIT 1';
    const results = await query(sql, [id_amount]);
    
    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id_amount: row.id_amount,
      user_id: row.user_id,
      money: row.money,
      registeredAt: row.registeredat, // Map lowercase to camelCase
      screenshot: row.screenshot
    };
  }

  static async findByUserId(user_id) {
    const sql = 'SELECT * FROM amounts WHERE user_id = ? ORDER BY registeredAt DESC';
    const results = await query(sql, [user_id]);
    
    return results.map(row => ({
      id_amount: row.id_amount,
      user_id: row.user_id,
      money: row.money,
      registeredAt: row.registeredat, // Map lowercase to camelCase
      screenshot: row.screenshot
    }));
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = 'SELECT a.*, u.name as user_name FROM amounts a JOIN users u ON a.user_id = u.id_user ORDER BY a.registeredAt DESC LIMIT ? OFFSET ?';
    const results = await query(sql, [limit, offset]);
    
    const countResult = await query('SELECT COUNT(*) as total FROM amounts');
    const totalCount = countResult[0].total;
    
    const normalizedData = results.map(row => ({
      id_amount: row.id_amount,
      user_id: row.user_id,
      money: row.money,
      registeredAt: row.registeredat,
      screenshot: row.screenshot,
      user_name: row.user_name
    }));
    
    return {
      data: normalizedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: parseInt(totalCount)
      }
    };
  }

  static async update(id_amount, updateData) {
    const updates = [];
    const params = [];

    if (updateData.money !== undefined) {
      updates.push('money = ?');
      params.push(updateData.money);
    }

    if (updates.length === 0) {
      return { modifiedCount: 0 };
    }

    params.push(id_amount);

    const sql = `UPDATE amounts SET ${updates.join(', ')} WHERE id_amount = ?`;
    const { rowCount } = await query(sql, params);

    return { modifiedCount: rowCount || 0 };
  }

  static async delete(id_amount) {
    const sql = 'DELETE FROM amounts WHERE id_amount = ?';
    const { rowCount } = await query(sql, [id_amount]);

    return { deletedCount: rowCount || 0 };
  }

  static async getTotalByUserId(user_id) {
    const sql = 'SELECT SUM(money) as total FROM amounts WHERE user_id = ?';
    const result = await query(sql, [user_id]);
    
    return parseFloat(result[0].total) || 0;
  }

  static async getTotal() {
    const sql = 'SELECT SUM(money) as total FROM amounts';
    const result = await query(sql, []);
    
    return parseFloat(result[0].total) || 0;
  }
}

module.exports = Amount;