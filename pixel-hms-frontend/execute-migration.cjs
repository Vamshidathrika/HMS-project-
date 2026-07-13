const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.fwmmmnkpkadvacejyawm',
  password: 'Vamshi9640@',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Reading migration file...');
    const sqlPath = path.join(__dirname, '..', 'supabase_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected! Executing migration script (this might take a few seconds)...');
    
    await client.query(sql);
    console.log('Migration SQL script executed successfully!');
    
    // Check if the patients table is now present and check count
    const res = await client.query('SELECT COUNT(*) FROM public.patients;');
    console.log(`Verification: 'patients' table count is ${res.rows[0].count}`);
    
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.position) console.error('Position:', err.position);
  } finally {
    await client.end();
  }
}

run();
