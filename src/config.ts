import { MigrationConfig } from "drizzle-orm/migrator";
import { ForbiddenError } from "./api/errors.js";

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
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
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
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
