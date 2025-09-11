const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// Admin model class
class Admin {
  constructor(adminData) {
    this.id = adminData.id;
    this.name = adminData.name;
    this.email = adminData.email;
    this.password = adminData.password;
    this.role = adminData.role || 'admin';
    this.permissions = adminData.permissions || {
      manageUsers: true,
      viewStatistics: true
    };
    this.registeredAt = adminData.registeredAt || new Date();
  }

  // Create a new admin
  static async create(adminData) {
    // Check if admin already exists
    const existingAdmin = await this.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new Error('Admin already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Convert permissions to JSON string
    const permissionsJSON = JSON.stringify(adminData.permissions || {
      manageUsers: true,
      viewStatistics: true
    });

    // Insert admin into database
    const result = await query(
      'INSERT INTO admins (name, email, password, role, permissions, registeredAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [adminData.name, adminData.email, adminData.password, adminData.role || 'admin', permissionsJSON]
    );

    // Return the newly created admin with its ID
    return {
      id: result.insertId,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role || 'admin',
      permissions: adminData.permissions || {
        manageUsers: true,
        viewStatistics: true
      },
      registeredAt: new Date()
    };
  }

  // Find admin by specific criteria
  static async findOne(criteria) {
    let sql = 'SELECT * FROM admins WHERE ';
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

    const admin = results[0];
    // Parse permissions from JSON string
    if (admin.permissions) {
      try {
        admin.permissions = JSON.parse(admin.permissions);
      } catch (error) {
        console.error('Error parsing permissions:', error);
        admin.permissions = {
          manageUsers: true,
          viewStatistics: true
        };
      }
    }

    return admin;
  }

  // Find admin by ID
  static async findById(id) {
    return this.findOne({ id });
  }

  // Update admin
  static async updateOne(criteria, updateData) {
    // First, find the admin to update
    const admin = await this.findOne(criteria);
    if (!admin) {
      return { modifiedCount: 0 };
    }

    // Handle password update
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Handle permissions update
    if (updateData.permissions) {
      updateData.permissions = JSON.stringify(updateData.permissions);
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

    const sql = `UPDATE admins SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`;
    const result = await query(sql, params);

    return { modifiedCount: result.affectedRows };
  }

  // Delete admin
  static async deleteOne(criteria) {
    // Build delete query
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(criteria)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }

    const sql = `DELETE FROM admins WHERE ${conditions.join(' AND ')}`;
    const result = await query(sql, params);

    return { deletedCount: result.affectedRows };
  }

  // Match password
  static async matchPassword(adminId, enteredPassword) {
    const admin = await this.findById(adminId);
    if (!admin) return false;
    return await bcrypt.compare(enteredPassword, admin.password);
  }
}

module.exports = Admin;

module.exports = Admin;
