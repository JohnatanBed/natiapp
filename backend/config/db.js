// PostgreSQL Database configuration
const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Connect to PostgreSQL database
const connectDB = async () => {
  try {
    // Verificar que todas las variables de entorno necesarias estén definidas
    // Render proporciona DATABASE_URL como variable de entorno única
    if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME)) {
      console.error('Error: Missing required environment variables.');
      console.error('Either provide DATABASE_URL or (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
      process.exit(1);
    }
    
    // Configuración del pool de conexiones
    const poolConfig = process.env.DATABASE_URL 
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        }
      : {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT || 5432,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };

    pool = new Pool(poolConfig);

    // Test the connection with timeout
    const connectionPromise = pool.query('SELECT NOW()');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('PostgreSQL database connection established successfully');
    return pool;
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    console.error('Please check that PostgreSQL server is running and the database credentials are correct.');
    throw error;
  }
};

// Execute a database query
const query = async (sql, params = []) => {
  try {
    // PostgreSQL usa $1, $2, $3... en lugar de ?
    // Convertir los ? a placeholders de PostgreSQL
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await pool.query(pgSql, params);
    
    // Devolver los rows con propiedades adicionales para compatibilidad
    const rows = result.rows;
    rows.rowCount = result.rowCount;
    rows.affectedRows = result.rowCount; // Alias para compatibilidad con MySQL
    
    // Si es un INSERT con RETURNING, agregar insertId simulado
    if (result.command === 'INSERT' && rows.length > 0 && rows[0].id_user) {
      rows.insertId = rows[0].id_user;
    } else if (result.command === 'INSERT' && rows.length > 0 && rows[0].id_admin) {
      rows.insertId = rows[0].id_admin;
    } else if (result.command === 'INSERT' && rows.length > 0 && rows[0].id_amount) {
      rows.insertId = rows[0].id_amount;
    } else if (result.command === 'INSERT' && rows.length > 0 && rows[0].id_loan) {
      rows.insertId = rows[0].id_loan;
    }
    
    return rows;
  } catch (error) {
    console.error('Error executing database query:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// Get the pool for advanced usage
const getPool = () => pool;

module.exports = { connectDB, query, getPool };
