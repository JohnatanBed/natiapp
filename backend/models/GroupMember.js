const { query } = require('../config/db');

class GroupMember {
  constructor(groupMemberData) {
    this.admin_id = groupMemberData.admin_id;
    this.user_id = groupMemberData.user_id;
    this.union_date = groupMemberData.union_date || new Date();
  }

  static async create(groupMemberData) {
    const userExistsQuery = 'SELECT id_user FROM users WHERE id_user = ? LIMIT 1';
    const userExists = await query(userExistsQuery, [groupMemberData.user_id]);
    
    if (userExists.length === 0) {
      throw new Error('User does not exist');
    }

    const adminExistsQuery = 'SELECT id_admin FROM admins WHERE id_admin = ? LIMIT 1';
    const adminExists = await query(adminExistsQuery, [groupMemberData.admin_id]);
    
    if (adminExists.length === 0) {
      throw new Error('Admin does not exist');
    }

    const relationExists = await this.findOne({
      admin_id: groupMemberData.admin_id,
      user_id: groupMemberData.user_id
    });
    
    if (relationExists) {
      throw new Error('User is already a member of this group');
    }

    const sql = 'INSERT INTO group_members (admin_id, user_id) VALUES (?, ?) RETURNING *';
    const params = [groupMemberData.admin_id, groupMemberData.user_id];

    const result = await query(sql, params);
    const newMember = result[0];

    return {
      admin_id: newMember.admin_id,
      user_id: newMember.user_id,
      union_date: newMember.union_date || newMember.joinedat
    };
  }

  static async findOne(criteria) {
    let sql = 'SELECT * FROM group_members WHERE ';
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

  static async findByAdminId(admin_id, includeUserDetails = false) {
    let sql;
    
    if (includeUserDetails) {
      sql = `
        SELECT gm.admin_id, gm.user_id, gm.union_date, u.name as user_name, u.phoneNumber, u.role
        FROM group_members gm 
        JOIN users u ON gm.user_id = u.id_user
        WHERE gm.admin_id = ? 
        ORDER BY gm.union_date DESC
      `;
    } else {
      sql = 'SELECT * FROM group_members WHERE admin_id = ? ORDER BY union_date DESC';
    }
    
    const results = await query(sql, [admin_id]);
    
    return results;
  }

  static async findByUserId(user_id, includeAdminDetails = false) {
    let sql;
    
    if (includeAdminDetails) {
      sql = `
        SELECT gm.admin_id, gm.user_id, gm.union_date, a.name as admin_name, a.email as admin_email
        FROM group_members gm 
        JOIN admins a ON gm.admin_id = a.id_admin 
        WHERE gm.user_id = ? 
        ORDER BY gm.union_date DESC
      `;
    } else {
      sql = 'SELECT * FROM group_members WHERE user_id = ? ORDER BY union_date DESC';
    }
    
    const results = await query(sql, [user_id]);
    
    return results;
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT gm.*, 
             u.name as user_name, 
             a.name as admin_name 
      FROM group_members gm 
      JOIN users u ON gm.user_id = u.id_user 
      JOIN admins a ON gm.admin_id = a.id_admin 
      ORDER BY gm.union_date DESC 
      LIMIT ? OFFSET ?
    `;
    
    const results = await query(sql, [limit, offset]);
    
    const countResult = await query('SELECT COUNT(*) as total FROM group_members');
    const totalCount = countResult[0].total;
    
    return {
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: parseInt(totalCount)
      }
    };
  }

  static async delete(admin_id, user_id) {
    const sql = 'DELETE FROM group_members WHERE admin_id = ? AND user_id = ?';
    const { rowCount } = await query(sql, [admin_id, user_id]);

    return { deletedCount: rowCount || 0 };
  }

  static async deleteAllByAdminId(admin_id) {
    const sql = 'DELETE FROM group_members WHERE admin_id = ?';
    const { rowCount } = await query(sql, [admin_id]);

    return { deletedCount: rowCount || 0 };
  }

  static async deleteAllByUserId(user_id) {
    const sql = 'DELETE FROM group_members WHERE user_id = ?';
    const { rowCount } = await query(sql, [user_id]);

    return { deletedCount: rowCount || 0 };
  }

  static async countMembersByAdminId(admin_id) {
    const sql = 'SELECT COUNT(*) as count FROM group_members WHERE admin_id = ?';
    const result = await query(sql, [admin_id]);
    
    return parseInt(result[0].count) || 0;
  }

  static async countGroupsByUserId(user_id) {
    const sql = 'SELECT COUNT(*) as count FROM group_members WHERE user_id = ?';
    const result = await query(sql, [user_id]);
    
    return parseInt(result[0].count) || 0;
  }
}

module.exports = GroupMember;