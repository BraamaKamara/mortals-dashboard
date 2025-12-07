#!/usr/bin/env node
// Quick script to check if users exist in the production database
// Usage: DATABASE_URL=postgresql://... node check-users.js

const { Client } = require('pg');

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error('❌ Error: set DATABASE_URL environment variable');
  process.exit(1);
}

const emails = ['braamakamara@outlook.com', 'ibrahimkamara930@gmail.com'];

(async () => {
  const client = new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon DB...');
    await client.connect();

    console.log(`\nQuerying for ${emails.length} emails...`);
    const res = await client.query(
      'SELECT id, email, username, created_at, email_verified FROM users WHERE email = ANY($1)',
      [emails]
    );

    if (res.rows.length === 0) {
      console.log('❌ No users found with those emails. Users may not be registered yet.');
    } else {
      console.log(`✅ Found ${res.rows.length} user(s):\n`);
      res.rows.forEach(row => {
        console.log(`  Email: ${row.email}`);
        console.log(`  Username: ${row.username}`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Created: ${row.created_at}`);
        console.log(`  Email Verified: ${row.email_verified}`);
        console.log('');
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Query error:', error.message);
    process.exit(1);
  }
})();
