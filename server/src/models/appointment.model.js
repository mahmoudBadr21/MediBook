import mongoose from "mongoose";
import { appointmentStatus } from "../utils/appointmentStatus.js";

const appointmentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    require: true
  },
  date: {
    type: Date,
    require: true
  },
  startTime: {
    type: String,
    require: true
  },
  endTime: {
    type: String,
    require: true
  },
  status: {
    type: String,
    enum: [appointmentStatus.CANCELLED, appointmentStatus.COMPLETED, appointmentStatus.CONFIMED, appointmentStatus.PENDING],
    default: appointmentStatus.PENDING
  }
}, { timestamps: true })

appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } }
  }
)

const Appointment = mongoose.model("Appointment", appointmentSchema)

export default Appointment