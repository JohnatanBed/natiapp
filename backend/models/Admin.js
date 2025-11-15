const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

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

  static async create(adminData) {
    const existingAdminByEmail = await this.findOne({ email: adminData.email });
    if (existingAdminByEmail) {
      throw new Error('Admin with this email already exists');
    }

    if (adminData.code_group) {
      const existingAdminByCode = await this.findOne({ code_group: adminData.code_group });
      if (existingAdminByCode) {
        throw new Error('Code group already in use');
      }
    } else {
      throw new Error('Code group is required');
    }

    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const result = await query(
      'INSERT INTO admins (name, email, password, code_group, role) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [adminData.name, adminData.email, adminData.password, adminData.code_group, adminData.role || 'admin']
    );

    const newAdmin = result[0];
    return {
      id_admin: newAdmin.id_admin,
      name: newAdmin.name,
      email: newAdmin.email,
      code_group: newAdmin.code_group,
      role: newAdmin.role,
      registeredAt: newAdmin.registeredat
    };
  }

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

  static async findById(id_admin) {
    return this.findOne({ id_admin });
  }
  
  static async findByCodeGroup(code_group) {
    return this.findOne({ code_group });
  }

  static async updateOne(criteria, updateData) {
    const admin = await this.findOne(criteria);
    if (!admin) {
      return { modifiedCount: 0 };
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    if (updateData.code_group) {
      const existingAdmin = await this.findOne({ code_group: updateData.code_group });
      if (existingAdmin && existingAdmin.id_admin !== admin.id_admin) {
        throw new Error('Code group already in use');
      }
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

    const sql = `UPDATE admins SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`;
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

    const sql = `DELETE FROM admins WHERE ${conditions.join(' AND ')}`;
    const { rowCount } = await query(sql, params);

    return { deletedCount: rowCount || 0 };
  }

  static async matchPassword(adminId, enteredPassword) {
    const admin = await this.findById(adminId);
    if (!admin) return false;
    return await bcrypt.compare(enteredPassword, admin.password);
  }
}

module.exports = Admin;
