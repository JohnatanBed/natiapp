const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

class User {
  constructor(userData) {
    this.id_user = userData.id_user;
    this.name = userData.name;
    this.phoneNumber = userData.phoneNumber;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.code_group = userData.code_group || null;
    this.registeredAt = userData.registeredAt || new Date();
  }

  static async create(userData) {
    const existingUser = await this.findOne({ phoneNumber: userData.phoneNumber });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const password = String(userData.password).trim();
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be exactly 4 digits');
    }

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, phoneNumber, password, role, code_group) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [userData.name, userData.phoneNumber, userData.password, userData.role || 'user', userData.code_group || null]
    );

    const newUser = result[0];
    return {
      id_user: newUser.id_user,
      name: newUser.name,
      phoneNumber: newUser.phonenumber,
      role: newUser.role,
      code_group: newUser.code_group,
      registeredAt: newUser.registeredat
    };
  }

  static async findOne(criteria) {
    let sql = 'SELECT * FROM users WHERE ';
    const params = [];
    const conditions = [];

    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    sql += conditions.join(' AND ');
    sql += ' LIMIT 1';

    const results = await query(sql, params);
    
    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  static async findById_user(id_user) {
    return this.findOne({ id_user });
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT id_user, name, phoneNumber, role, code_group, registeredAt FROM users';
    const params = [];
    const conditions = [];

    if (Object.keys(filters).length > 0) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY registeredAt DESC';
    
    const results = await query(sql, params);
    
    return results;
  }

  static async updateOne(criteria, updateData) {
    const user = await this.findOne(criteria);
    if (!user) {
      return { modifiedCount: 0 };
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      updates.push(`${key} = ?`);
      params.push(value);
    }

    const conditions = [];
    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`;
    const { rowCount } = await query(sql, params);

    return { modifiedCount: rowCount || 0 };
  }

  static async deleteOne(criteria) {
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    const sql = `DELETE FROM users WHERE ${conditions.join(' AND ')}`;
    const { rowCount } = await query(sql, params);

    return { deletedCount: rowCount || 0 };
  }

  static async matchPassword(id_user, enteredPassword) {
    const user = await this.findById_user(id_user);
    if (!user) return false;
    return await bcrypt.compare(enteredPassword, user.password);
  }
}

module.exports = User;
