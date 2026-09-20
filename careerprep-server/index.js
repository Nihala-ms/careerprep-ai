import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://careerprep-ai-app.vercel.app",
  "https://careerprep-ai-qq0vwho53-nihala-ms-projects.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an origin
    // Example: Postman, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked CORS origin:", origin);
    return callback(null, false);
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: false,

  optionsSuccessStatus: 204,
};

// Apply CORS
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));
// ======================================================
// Body parser
// ======================================================

app.use(express.json());

// ======================================================
// Root route
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI Server is running 🚀",
  });
});

// ======================================================
// Health check
// ======================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPrep AI backend is connected!",
  });
});

// ======================================================
// AI routes
// ======================================================

app.use("/api/ai", aiRoutes);

// ======================================================
// 404 handler
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// Error handler
// ======================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ======================================================
// Local development
// ======================================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`CareerPrep AI server running on port ${PORT}`);
  });
}

// ======================================================
// Vercel
// ======================================================

export default app;
