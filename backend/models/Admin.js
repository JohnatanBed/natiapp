const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// Admin model class
class Admin {
  constructor(adminData) {
    this.id_admin = adminData.id_admin;
    this.name = adminData.name;
    this.email = adminData.email;
    this.password = adminData.password;
    this.code_group = adminData.code_group;
    this.role = adminData.role || 'admin';
    this.registeredAt = adminData.registeredAt || new Date();
  }

  // Create a new admin
  static async create(adminData) {
    // Check if admin already exists with same email
    const existingAdminByEmail = await this.findOne({ email: adminData.email });
    if (existingAdminByEmail) {
      throw new Error('Admin with this email already exists');
    }

    // Check if code_group is already in use
    if (adminData.code_group) {
      const existingAdminByCode = await this.findOne({ code_group: adminData.code_group });
      if (existingAdminByCode) {
        throw new Error('Code group already in use');
      }
    } else {
      throw new Error('Code group is required');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Insert admin into database
    const result = await query(
      'INSERT INTO admins (name, email, password, code_group, role) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [adminData.name, adminData.email, adminData.password, adminData.code_group, adminData.role || 'admin']
    );

    const newAdmin = result[0];
    // Return the newly created admin with its ID
    return {
      id_admin: newAdmin.id_admin,
      name: newAdmin.name,
      email: newAdmin.email,
      code_group: newAdmin.code_group,
      role: newAdmin.role,
      registeredAt: newAdmin.registeredat
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
    return admin;
  }

  // Find admin by ID
  static async findById(id_admin) {
    return this.findOne({ id_admin });
  }
  
  // Find admin by code_group
  static async findByCodeGroup(code_group) {
    return this.findOne({ code_group });
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

    // Check if code_group is being updated and is unique
    if (updateData.code_group) {
      const existingAdmin = await this.findOne({ code_group: updateData.code_group });
      if (existingAdmin && existingAdmin.id_admin !== admin.id_admin) {
        throw new Error('Code group already in use');
      }
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
    const { rowCount } = await query(sql, params);

    return { modifiedCount: rowCount || 0 };
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
    const { rowCount } = await query(sql, params);

    return { deletedCount: rowCount || 0 };
  }

  // Match password
  static async matchPassword(adminId, enteredPassword) {
    const admin = await this.findById(adminId);
    if (!admin) return false;
    return await bcrypt.compare(enteredPassword, admin.password);
  }
}

module.exports = Admin;
