import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://careerprep-ai-app.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =====================================================
// BODY PARSER
// =====================================================
app.use(express.json());

// =====================================================
// ROOT ROUTE
// =====================================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI Server is running 🚀",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI backend is connected!",
  });
});

// =====================================================
// AI ROUTES
// =====================================================
app.use("/api/ai", aiRoutes);

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================================
// LOCAL SERVER
// =====================================================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`CareerPrep AI server running on port ${PORT}`);
  });
}

// =====================================================
// EXPORT FOR VERCEL
// =====================================================
export default app;
