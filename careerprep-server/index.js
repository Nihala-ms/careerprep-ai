import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://careerprep-ai.vercel.app",
  "https://careerprep-ai-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman or server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost during development
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Allow known deployed frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For now, allow other origins as well.
      // This prevents deployment problems while testing.
      return callback(null, true);
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: false,

    optionsSuccessStatus: 204,
  })
);

/* =========================================================
   EXPLICIT PREFLIGHT
========================================================= */

app.options("*", cors());

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

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

/* =========================================================
   AI ROUTES
========================================================= */

app.use("/api/ai", aiRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message:
      err?.message || "Internal server error",
  });
});

/* =========================================================
   LOCAL SERVER
========================================================= */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(
      `CareerPrep AI server running on port ${PORT}`
    );
  });
}

/* =========================================================
   VERCEL
========================================================= */

export default app;