import { MigrationConfig } from "drizzle-orm/migrator";
import { ForbiddenError } from "./api/errors.js";

type Config = {
  api: APIConfig;
  db: DBConfig;
  jwt: JWTConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: string;
  polkaApiKey: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type JWTConfig = {
  defaultDuration: number;
  refreshDuration: number;
  secret: string;
  issuer: string;
};

process.loadEnvFile();

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/lib/db/migrations",
};

export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: platformCheck(envOrThrow("PLATFORM")),
    polkaApiKey: envOrThrow("POLKA_KEY"),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
  jwt: {
    defaultDuration: 60 * 60,
    refreshDuration: 60 * 60 * 24 * 60 * 1000,
    secret: envOrThrow("JWT_SECRET"),
    issuer: "chirpy",
  },
};

//helpers
function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function platformCheck(val: string) {
  if (val !== "dev") {
    throw new ForbiddenError("403 Forbidden");
  }
  return val;
}
