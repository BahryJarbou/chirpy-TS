import express from "express";

import { handlerReadiness } from "./api/healthz.js";
import { middlewareLogResponses } from "./api/middleware/responseLogger.js";
import { middlewareMetricsInc } from "./api/middleware/metricsMiddleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerValidateChirp } from "./api/chirp.js";
import { handlerReset } from "./api/reset.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.post("/api/validate_chirp", handlerValidateChirp);

app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});
