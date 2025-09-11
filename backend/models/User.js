const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// User model class
class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.phoneNumber = userData.phoneNumber;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.registeredAt = userData.registeredAt || new Date();
  }

  // Create a new user
  static async create(userData) {
    // Check if user already exists
    const existingUser = await this.findOne({ phoneNumber: userData.phoneNumber });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Asegurar que la contraseña sea exactamente 4 dígitos
    const password = String(userData.password).trim();
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be exactly 4 digits');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await query(
      'INSERT INTO users (name, phoneNumber, password, role, registeredAt) VALUES (?, ?, ?, ?, NOW())',
      [userData.name, userData.phoneNumber, userData.password, userData.role || 'user']
    );

    // Return the newly created user with its ID
    return {
      id: result.insertId,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'user',
      registeredAt: new Date()
    };
  }

  // Find user by specific criteria
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

  // Find user by ID
  static async findById(id) {
    return this.findOne({ id });
  }

  // Update user
  static async updateOne(criteria, updateData) {
    // First, find the user to update
    const user = await this.findOne(criteria);
    if (!user) {
      return { modifiedCount: 0 };
    }

    // Handle password update
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Build update query
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      updates.push(`${key} = ?`);
      params.push(value);
    }

    // Add criteria to WHERE clause
    const conditions = [];
    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`;
    const result = await query(sql, params);

    return { modifiedCount: result.affectedRows };
  }

  // Delete user
  static async deleteOne(criteria) {
    // Build delete query
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    const sql = `DELETE FROM users WHERE ${conditions.join(' AND ')}`;
    const result = await query(sql, params);

    return { deletedCount: result.affectedRows };
  }

  // Match password
  static async matchPassword(userId, enteredPassword) {
    const user = await this.findById(userId);
    if (!user) return false;
    return await bcrypt.compare(enteredPassword, user.password);
  }
}

module.exports = User;
