import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json());

/* =========================================================
   AI ROUTES
========================================================= */

app.use("/api/ai", aiRoutes);

/* =========================================================
   HOME ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "CareerPrep AI Server is running 🚀",
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "CareerPrep AI backend is connected!",
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `CareerPrep AI server running on port ${PORT}`
  );
});