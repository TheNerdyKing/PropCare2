import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Import routers
import publicRouter from "./routes/public";
import authRouter from "./routes/auth";
import ticketRouter from "./routes/tickets";
import contractorRouter from "./routes/contractors";
import dashboardRouter from "./routes/dashboard";
import propertyRouter from "./routes/properties";
import demoRouter from "./routes/demo";

const app = express();
app.use(express.json());

// API Routes
app.use("/api/public", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/contractors", contractorRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/demo", demoRouter);

// API Catch-all
app.all("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "API endpoint not found", 
    method: req.method,
    path: req.url 
  });
});

export default app;
