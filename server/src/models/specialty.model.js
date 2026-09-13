import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "name is required"],
    unique: true
  },
  description: {
    type: String,
  },
  img: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {timestamps: true})

const Specialty = mongoose.model("Specialty", specialtySchema)

export default Specialty