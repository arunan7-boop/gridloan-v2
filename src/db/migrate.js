require('dotenv').config();
const { pool } = require('./pool');

const MIGRATION = `
  CREATE TABLE IF NOT EXISTS waitlist_signups (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name        VARCHAR(200)  NOT NULL,
    email            VARCHAR(320)  NOT NULL,
    user_type        VARCHAR(50)   NOT NULL
                       CHECK (user_type IN ('Hardware Owner', 'Compute Consumer', 'Both')),
    alpha_beta_optin BOOLEAN       NOT NULL DEFAULT FALSE,
    ip_address       INET,
    user_agent       TEXT,
    referrer         TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email
    ON waitlist_signups (LOWER(email));

  CREATE INDEX IF NOT EXISTS idx_waitlist_user_type
    ON waitlist_signups (user_type);

  CREATE INDEX IF NOT EXISTS idx_waitlist_created_at
    ON waitlist_signups (created_at DESC);

  CREATE TABLE IF NOT EXISTS waitlist_stats (
    key   VARCHAR(100) PRIMARY KEY,
    value BIGINT       NOT NULL DEFAULT 0
  );

  INSERT INTO waitlist_stats (key, value)
    VALUES ('total_signups', 0)
    ON CONFLICT (key) DO NOTHING;

  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_waitlist_updated_at ON waitlist_signups;
  CREATE TRIGGER trg_waitlist_updated_at
    BEFORE UPDATE ON waitlist_signups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migration…');
    await client.query(MIGRATION);
    console.log('✓ Migration complete');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
