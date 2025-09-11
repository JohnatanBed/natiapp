// MySQL Database configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

// Connect to MySQL database
const connectDB = async () => {
  try {
    // Verificar que todas las variables de entorno necesarias estén definidas
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
      console.error('Please check your .env file and ensure all database variables are defined.');
      process.exit(1);
    }
    
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection with timeout
    const connectionPromise = pool.getConnection();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 5000); // 5 segundos de timeout
    });
    
    const connection = await Promise.race([connectionPromise, timeoutPromise]);
    console.log('MySQL database connection established successfully');
    connection.release();
    return pool;
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    console.error('Please check that MySQL server is running and the database credentials are correct.');
    // No salir del proceso inmediatamente para permitir manejar el error
    throw error;
  }
};
// Execute a database query
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing database query:', error);
    throw error;
  }
};

module.exports = { connectDB, query };
