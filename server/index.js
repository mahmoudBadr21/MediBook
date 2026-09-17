import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { configDotenv } from 'dotenv'
import { ERROR } from './src/utils/httpSatutsText.js'
import { router as authRouter } from "./src/routes/auth.route.js"
import { router as specialtyRouter } from "./src/routes/specialty.route.js"
import { router as doctorRouter } from './src/routes/doctor.route.js'
import { router as availabilityRouter } from './src/routes/availability.route.js'
import { router as appointmentRouter } from './src/routes/appointment.route.js'
import { router as dashboardRouter } from './src/routes/dashboard.route.js'

configDotenv({
  path: "./src/utils/.env",
  quiet: true,
})
const app = express()

const dataBaseURL = process.env.MONGO_URI
mongoose.connect(dataBaseURL).then(() => console.log("mongodb server started"))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter)
app.use("/api/specialty", specialtyRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/availability", availabilityRouter)
app.use("/api/appointment", appointmentRouter)
app.use("/api/dashboard", dashboardRouter)

// global middleware for not found route
app.use((req, res) => {
  console.log("global middleware for not found router");
  return res.status(404).json({statusText: ERROR, message: "This resource not found"})
})

// global error handler
app.use((err, req, res, next) => {
  console.log("global error handler");
  console.log(err);
  
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