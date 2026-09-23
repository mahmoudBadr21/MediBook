import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { configDotenv } from 'dotenv'
import { ERROR } from './src/utils/httpSatutsText.js'
import { verifyToken } from './src/middlewares/verifyToken.js'
import { allowedTo } from './src/middlewares/allowedTo.js'
import { userRoles } from './src/utils/userRoles.js'
import { router as authRouter } from "./src/routes/auth.route.js"
import { router as specialtyRouter } from "./src/routes/specialty.route.js"
import { router as doctorRouter } from './src/routes/doctor.route.js'
import { router as availabilityRouter } from './src/routes/availability.route.js'
import { router as appointmentRouter } from './src/routes/appointment.route.js'
import { router as dashboardRouter } from './src/routes/dashboard.route.js'
import { router as doctorDashboardRouter } from './src/routes/doctorDashboard.route.js'
import { router as patientDashboardRouter } from './src/routes/patientDashboard.route.js'

configDotenv({
  path: "./src/utils/.env",
  quiet: true,
})
const app = express()

app.use(helmet());

const allowedOrigins = [
  "http://localhost:3000",
  "https://yourdomain.com",
  "https://admin.yourdomain.com"
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "FAIL",
    message: "Too many login/auth attempts, please try again after 15 minutes."
  }
});

const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "FAIL",
    message: "Too many requests to the dashboard, please slow down."
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "FAIL",
    message: "Too many requests, please try again later."
  }
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

const dataBaseURL = process.env.MONGO_URI
mongoose.connect(dataBaseURL).then(() => console.log("mongodb server started"))

app.use("/api/auth", authLimiter, authRouter)

app.use("/api/specialty", apiLimiter, specialtyRouter)
app.use("/api/doctor", apiLimiter, doctorRouter)
app.use("/api/availability", apiLimiter, availabilityRouter)
app.use("/api/appointment", apiLimiter, appointmentRouter)

app.use("/api/dashboard", dashboardLimiter, verifyToken, allowedTo(userRoles.ADMIN), dashboardRouter)
app.use("/api/doctorDashboard", dashboardLimiter, verifyToken, allowedTo(userRoles.DOCTOR), doctorDashboardRouter)
app.use("/api/patientDashboard", dashboardLimiter, verifyToken, allowedTo(userRoles.PATIENT), patientDashboardRouter)

// global middleware for not found route
app.use((req, res) => {
  console.log("global middleware for not found router");
  return res.status(404).json({statusText: ERROR, message: "This resource not found"})
})

// global error handler
app.use((err, req, res, next) => {
  console.log("global error handler");
  return res.status(err.statusCode || 500).json({
    statusText: err.statusText || ERROR,
    message: err.message,
    code: err.statusCode || 500,
    data: null
  })
})

app.listen(process.env.port || 5000, () => {
  console.log("server is listenning on port 5000");
})