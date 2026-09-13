import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  specialtyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialty",
  },
  bio: {
    type: String,
  },
  experience: {
    type: Number
  },
  consultationPrice: {
    type: Number
  },
  education: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
}, {timestamps: true})

const Doctor = mongoose.model("Doctor", doctorSchema)

export default Doctor