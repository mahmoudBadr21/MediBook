import mongoose from "mongoose";
import validator from "validator"
import { userRoles } from "../utils/userRoles.js"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate: [validator.isEmail, 'feiled must be valid email address']
  },
  password: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: [userRoles.PATIENT, userRoles.DOCTOR, userRoles.ADMIN],
    default: userRoles.PATIENT
  },
  avatar: {
    type: String,
    default: "profile.png"
  }
},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User