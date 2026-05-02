require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getAllSignups } = require('./queries');
const { pool } = require('./pool');

async function exportCSV() {
  const rows = await getAllSignups();
  const outDir = path.join(__dirname, '../../exports');
  fs.mkdirSync(outDir, { recursive: true });
  const filename = `waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
  const outPath = path.join(outDir, filename);
  const header = ['id', 'full_name', 'email', 'user_type', 'alpha_beta_optin', 'created_at'];
  const lines = [
    header.join(','),
    ...rows.map(r =>
      [r.id, `"${r.full_name}"`, r.email, r.user_type, r.alpha_beta_optin, r.created_at].join(',')
    ),
  ];
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`✓ Exported ${rows.length} rows to ${outPath}`);
  await pool.end();
}

exportCSV().catch(err => { console.error(err); process.exit(1); });
