import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sslOptions = process.env.PG_DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;

const client = new pg.Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: sslOptions,
});

const initDb = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Connected to the database. Running init.sql...');
    const sql = fs.readFileSync('./src/init.sql').toString();
    await client.query(sql);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err.message);
    console.error('Stack Trace:', err.stack);
  } finally {
    await client.end();
  }
};

initDb();
