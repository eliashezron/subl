import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.PG_PORT);

const pool = new pg.Pool({
  port: process.env.PG_PORT,
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("Database connected");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connection test successful:", result.rows);
  } catch (error) {
    console.error("Error testing database connection:", error);
  } finally {
    await pool.end();
  }
};

testConnection();
