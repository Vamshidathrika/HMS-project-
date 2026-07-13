const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres', // default password from application-dev.yml
  database: 'postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to local Postgres!');
    const res = await client.query('SELECT datname FROM pg_database;');
    console.log('Databases:', res.rows.map(r => r.datname));
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
