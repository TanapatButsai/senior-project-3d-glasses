const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "glasses_try_on",
  password: process.env.POSTGRES_PASSWORD || "yourpassword",
  port: process.env.POSTGRES_PORT || 5432,
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    // สร้างตาราง users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // สร้างตาราง glasses
    await client.query(`
      CREATE TABLE IF NOT EXISTS glasses (
        glasses_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        model_file VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        try_count INTEGER DEFAULT 0
      );
    `);

    // สร้างตาราง favorites
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id UUID REFERENCES users(user_id),
        glasses_id UUID REFERENCES glasses(glasses_id),
        PRIMARY KEY (user_id, glasses_id)
      );
    `);

    console.log("✅ Tables are set up successfully.");
  } catch (error) {
    console.error("❌ Error setting up tables:", error);
  } finally {
    client.release();
  }
};

createTables().then(() => pool.end());
