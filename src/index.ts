import express from "express";

import { handlerReadiness } from "./api/healthz.js";
import { middlewareLogResponses } from "./api/middleware/responseLogger.js";
import { middlewareMetricsInc } from "./api/middleware/metricsMiddleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerValidateChirp } from "./api/chirps.js";
import { handlerReset } from "./api/reset.js";
import { errorHandler } from "./api/middleware/errorHandler.js";

const app = express();
const PORT = 8080;

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

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});
