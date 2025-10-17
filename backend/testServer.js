import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import collectorRoutes from "./routes/collectorRoutes.js";
import wmaRoutes from "./routes/wmaRoutes.js";
import garbageRoutes from "./routes/garbageRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import smartDeviceRoutes from "./routes/smartDeviceRoutes.js";
import binRoutes from "./routes/binRoutes.js";

dotenv.config();

// Create an express app for tests. IMPORTANT: do not call app.listen here.
const app = express();

const corsOptions = { origin: true, credentials: true };
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic health route used by some tests
app.get("/api", (req, res) => res.send("Connected to CleanPath API"));

app.use("/api/users", userRoutes);
app.use("/api/wmas", wmaRoutes);
app.use("/api/garbage", garbageRoutes);
app.use("/api/collector", collectorRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/smartDevices", smartDeviceRoutes);
app.use("/api/bins", binRoutes);

// Connect to DB if not already connected. This mirrors index.js behavior but avoids listen().
connectDB();

export default app;
