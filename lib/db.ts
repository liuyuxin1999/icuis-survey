import { Pool } from "pg";
import bcrypt from "bcryptjs";

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getPool(): Pool {
  if (pool) return pool;

  pool = new Pool({
    host: env("POSTGRES_SERVER", "127.0.0.1"),
    port: Number(env("POSTGRES_PORT", "5432")),
    database: env("POSTGRES_DB", "msun_icuis"),
    user: env("POSTGRES_USER", "postgres"),
    password: env("POSTGRES_PASSWORD"),
    max: Number(process.env.POSTGRES_POOL_MAX ?? "10"),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  pool.on("error", (error) => console.error("PostgreSQL pool error", error));
  return pool;
}

export async function ensureDatabase(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initializeSchema().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

async function initializeSchema(): Promise<void> {
  const database = getPool();
  await database.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      answers JSONB NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS responses_created_at_idx ON responses (created_at DESC);
    CREATE TABLE IF NOT EXISTS admin_users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 12);
  await database.query(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    [username, passwordHash],
  );
}

export async function resetAdminPassword(username: string, password: string): Promise<void> {
  await ensureDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  await getPool().query(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [username, passwordHash],
  );
}
