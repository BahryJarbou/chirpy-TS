import express from "express";
import { handlerReadiness } from "./api/healthz.js";

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));
app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});
