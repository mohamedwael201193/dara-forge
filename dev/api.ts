import cors from "cors";
import "dotenv/config";
import express from "express";

import anchorHandler from "../api/anchor.js";
import attestHandler from "../api/attest.js";
import computeHandler from "../api/compute.js";
import mintHandler from "../api/mint.js";
import proxyHandler from "../api/storage/proxy.js";
import uploadHandler from "../api/storage/upload.js";

const app = express();

// generic middlewares (multipart routes parse in their own handler)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bridge Express req/res to Vercel-style handlers
app.all("/api/storage/upload", (req, res) =>
  uploadHandler(req as any, res as any)
);
app.all("/api/storage/proxy", (req, res) =>
  proxyHandler(req as any, res as any)
);
app.all("/api/anchor", (req, res) => anchorHandler(req as any, res as any));
app.all("/api/attest", (req, res) => attestHandler(req as any, res as any));
app.all("/api/compute", (req, res) => computeHandler(req as any, res as any));
app.all("/api/mint", (req, res) => mintHandler(req as any, res as any));

// DA endpoints
// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      storage: "mainnet",
      compute: "testnet",
      da: "testnet",
      anchor: "mainnet",
    },
  });
});

app.get("/api/compute/health", async (req, res) => {
  try {
    const computeHealthHandler = await import("../api/compute-health.js");
    return computeHealthHandler.default(req as any, res as any);
  } catch (error) {
    console.error("[Dev API] Compute health check error:", error);
    res.status(500).json({ ok: false, error: "Compute health check failed" });
  }
});

app.post("/api/da", async (req, res) => {
  try {
    const daHandler = await import("../api/da.js");
    return daHandler.default(req as any, res as any);
  } catch (error) {
    console.error("[Dev API] DA endpoint error:", error);
    res.status(500).json({ ok: false, error: "DA endpoint failed" });
  }
});

app.post("/api/da/publish", async (req, res) => {
  try {
    const publishHandler = await import("../api/da/publish.js");
    return publishHandler.default(req as any, res as any);
  } catch (error) {
    console.error("[Dev API] DA publish error:", error);
    res.status(500).json({ ok: false, error: "DA publish failed" });
  }
});

app.get("/api/da/verify", async (req, res) => {
  try {
    const verifyHandler = await import("../api/da/verify.js");
    return verifyHandler.default(req as any, res as any);
  } catch (error) {
    console.error("[Dev API] DA verify error:", error);
    res.status(500).json({ ok: false, error: "DA verify failed" });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
});
