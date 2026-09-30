import fs from "node:fs";
import pg from "pg";
import bcrypt from "bcryptjs";

function loadLocalEnv() {
  const path = new URL("../.env.local", import.meta.url);
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}

loadLocalEnv();

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const pool = new pg.Pool({
  host: required("POSTGRES_SERVER", "127.0.0.1"),
  port: Number(required("POSTGRES_PORT", "5432")),
  database: required("POSTGRES_DB", "msun_icuis"),
  user: required("POSTGRES_USER", "postgres"),
  password: required("POSTGRES_PASSWORD"),
  ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  await pool.query(fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  const username = required("ADMIN_USERNAME", "admin");
  const password = required("ADMIN_PASSWORD", "admin123");
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [username, passwordHash],
  );
  console.log(`PostgreSQL initialized. Administrator account: ${username}`);
} finally {
  await pool.end();
}
