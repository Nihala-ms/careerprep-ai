import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// ======================================================
// CORS
// ======================================================

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};

// CORS middleware
app.use(cors(corsOptions));

// Explicit preflight handling
app.options(/.*/, cors(corsOptions));

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI Server is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI backend is connected!",
  });
});

// ======================================================
// AI ROUTES
// ======================================================

app.use("/api/ai", aiRoutes);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ======================================================
// LOCAL DEVELOPMENT
// ======================================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`CareerPrep AI server running on port ${PORT}`);
  });
}

export default app;