import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  database: 'employees_db',  // Ensure you're connected to employees_db, not postgres
  port: 5432,
});

const connectToDb = async () => {
  try {
    // Connect to the "employees_db" database
    await pool.connect();
    console.log('Connected to the employees_db database.');
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);  // Exit if the database connection fails
  }
};

export { pool, connectToDb };
