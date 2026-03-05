import dotenv from "dotenv";
dotenv.config();
if (process.env.PROPC_DATABASE_URL) {
  process.env.PROPC_DATABASE_URL = process.env.PROPC_DATABASE_URL.trim();
}

import app from "./src/server/app";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Attach io to app for use in routes
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("[Socket] Client connected:", socket.id);
    
    socket.on("join-tenant", (tenantId) => {
      socket.join(`tenant:${tenantId}`);
      console.log(`[Socket] Client ${socket.id} joined tenant:${tenantId}`);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Client disconnected:", socket.id);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] PropCare running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Critical startup error:", err);
});
