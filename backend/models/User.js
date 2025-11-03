const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// User model class
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
      'INSERT INTO users (name, phoneNumber, password, role, code_group) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [userData.name, userData.phoneNumber, userData.password, userData.role || 'user', userData.code_group || null]
    );

    // Return the newly created user with its id_user
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

  // Find user by id_user
  static async findById_user(id_user) {
    return this.findOne({ id_user });
  }

  // Find all users with optional filters
  static async findAll(filters = {}) {
    let sql = 'SELECT id_user, name, phoneNumber, role, code_group, registeredAt FROM users';
    const params = [];
    const conditions = [];

    // Apply filters if provided
    if (Object.keys(filters).length > 0) {
      for (const [key, value] of Object.entries(filters)) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY registeredAt DESC';
    
    console.log('User.findAll SQL:', sql);
    console.log('User.findAll params:', params);
    
    const results = await query(sql, params);
    console.log('User.findAll results count:', results.length);
    
    return results;
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
    const { rowCount } = await query(sql, params);

    return { modifiedCount: rowCount || 0 };
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
    const { rowCount } = await query(sql, params);

    return { deletedCount: rowCount || 0 };
  }

  // Match password
  static async matchPassword(id_user, enteredPassword) {
    const user = await this.findById_user(id_user);
    if (!user) return false;
    return await bcrypt.compare(enteredPassword, user.password);
  }
}

module.exports = User;
