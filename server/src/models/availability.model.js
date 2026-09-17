import mongoose from "mongoose";

const availabilitySchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    require: true
  },
  dayOfWeek: {
    type: String,
    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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
  slotDuration: {
    type: Number,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

availabilitySchema.index(
  { doctor: 1, dayOfWeek: 1, startTime: 1 },
  { unique: true }
)

const Availability = mongoose.model("Availability", availabilitySchema)

export default Availability