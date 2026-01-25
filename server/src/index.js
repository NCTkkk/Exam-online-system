const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const examRoute = require("./routes/exam");
const Submission = require("./routes/submission");
const userRoute = require("./routes/user");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.log("❌ DB Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/exams", examRoute);
app.use("/api/submissions", Submission);
app.use("/api/users", userRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
