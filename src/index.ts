import express from "express";
import { handlerReadiness } from "./api/healthz.js";
import { middlewareLogResponses } from "./api/middleware/responseLogger.js";
import { middlewareMetricsInc } from "./api/middleware/metricsMiddleware.js";
import { handlerMetrics, handlerReset } from "./api/metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);
app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});
