const { pool } = require('./pool');

async function insertSignup({ fullName, email, userType, alphaBetaOptin, ipAddress, userAgent, referrer }) {
  const { rows } = await pool.query(
    `INSERT INTO waitlist_signups
       (full_name, email, user_type, alpha_beta_optin, ip_address, user_agent, referrer)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, full_name, email, user_type, alpha_beta_optin, created_at`,
    [fullName, email.toLowerCase().trim(), userType, alphaBetaOptin,
     ipAddress || null, userAgent || null, referrer || null]
  );
  await pool.query(
    `UPDATE waitlist_stats SET value = value + 1 WHERE key = 'total_signups'`
  );
  return rows[0];
}

async function getCount() {
  const { rows } = await pool.query(
    `SELECT value FROM waitlist_stats WHERE key = 'total_signups'`
  );
  return rows[0]?.value ?? 0;
}

async function emailExists(email) {
  const { rows } = await pool.query(
    `SELECT 1 FROM waitlist_signups WHERE LOWER(email) = $1`,
    [email.toLowerCase().trim()]
  );
  return rows.length > 0;
}

async function getAllSignups() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, user_type, alpha_beta_optin, created_at
     FROM waitlist_signups ORDER BY created_at DESC`
  );
  return rows;
}

async function getBreakdown() {
  const { rows } = await pool.query(
    `SELECT user_type, COUNT(*)::int AS count
     FROM waitlist_signups GROUP BY user_type ORDER BY count DESC`
  );
  return rows;
}

module.exports = { insertSignup, getCount, emailExists, getAllSignups, getBreakdown };
