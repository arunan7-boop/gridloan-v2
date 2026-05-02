const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function testConnection() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() AS time');
    console.log(`✓ Database connected — server time: ${rows[0].time}`);
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
