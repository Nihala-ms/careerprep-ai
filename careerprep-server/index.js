import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://careerprep-ai-app.vercel.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

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

app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`CareerPrep AI server running on port ${PORT}`);
  });
}

export default app;