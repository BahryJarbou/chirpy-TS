import express from "express";

import { handlerReadiness } from "./api/healthz.js";
import { middlewareLogResponses } from "./api/middleware/responseLogger.js";
import { middlewareMetricsInc } from "./api/middleware/metricsMiddleware.js";
import { handlerMetrics } from "./api/metrics.js";
import {
  handlerCreateChirp,
  handlerGetChirp,
  handlerGetChirps,
} from "./api/chirps.js";
import { handlerReset } from "./api/reset.js";
import { errorHandler } from "./api/middleware/errorHandler.js";

import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerLogin } from "./api/auth.js";
import { handlerCreateUser } from "./api/users.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res).catch(next));
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res).catch(next));
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetChirps(req, res).catch(next));
});

app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerGetChirp(req, res).catch(next));
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

app.use(errorHandler);

app.listen(config.api.port, () => {
  console.log(`Sever is running at http://localhost:${config.api.port}`);
});
