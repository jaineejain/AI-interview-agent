import "./config/env.js";
import express from "express";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  `${process.env.CLIENT_URL || "http://localhost:5173"},http://127.0.0.1:5173`
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const requiredEnv = [
  "MONGODB_URL",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required env variables: ${missingEnv.join(", ")}`);
}

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI Interview Agent Server Running 🚀",
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

const PORT = process.env.PORT || 6000;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Allowed Origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
