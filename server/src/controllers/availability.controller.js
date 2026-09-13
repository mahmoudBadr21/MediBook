import { validationResult } from "express-validator";
import Availability from "../models/availability.model.js";
import Doctor from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

const createAvailability = asyncWrapper(async(req, res, next) => {
  const userId = req.currentUser._id
  const doctor = await Doctor.findOne({user: userId})
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ')
      const error = new AppError(messages, 400, FAIL)
      return next(error)
    }

  const { dayOfWeek, startTime, endTime, slotDuration } = req.body

  const conflict = await Availability.findOne({
    _id: {$ne : availability._id},
    doctor: doctor._id,
    dayOfWeek,
    startTime: {$lt: endTime},
    endTime: {$gt: startTime}
  })
  if (conflict) {
    const error = new AppError("this availability conflicts with another availability", 400, FAIL)
    return next(error)
  }

  const newAvailability = await Availability.create({
    doctor: doctor._id,
    dayOfWeek,
    startTime,
    endTime,
    slotDuration
  })
  return res.json({status: SUCCESS, data: {newAvailability}})
})

const getMyAvailability = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser._id
  const doctor = await Doctor.findOne({user: userId})
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  const availabilities = await Availability.find({ doctor: doctor._id })
  return res.json({status: SUCCESS, data: {availabilities}})
})

const deleteAvailability = asyncWrapper(async (req, res, next) => {
  const { availabilityId } = req.params
  const availability = await Availability.findById(availabilityId)
  if (!availability) {
    const error = new AppError("availability not found", 404, FAIL)
    return next(error)
  }

  const doctor = await Doctor.findOne({user: req.currentUser._id})
  if (availability.doctor == doctor._id) {
    const error = new AppError("doctor not have this availability", 400, FAIL)
    return next(error)
  }

  await availability.deleteOne()
  return res.json({status: SUCCESS, data: null})
})

const updateAvailability = asyncWrapper(async (req, res, next) => {
  const { availabilityId } = req.params
  const availability = await Availability.findById(availabilityId)
  if (!availability) {
    const error = new AppError("availability not found", 404, FAIL)
    return next(error)
  }

  const doctor = await Doctor.findOne({user: req.currentUser._id})
  if (!equals(availability.doctor, doctor._id)) {
    const error = new AppError("doctor not have this availability", 400, FAIL)
    return next(error)
  }

  const { dayOfWeek, startTime, endTime, slotDuration } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ')
    const error = new AppError(messages, 400, FAIL)
    return next(error)
  }

  const conflict = await Availability.findOne({
    _id: {$ne : availability._id},
    doctor: doctor._id,
    dayOfWeek,
    startTime: {$lt: endTime},
    endTime: {$gt: startTime}
  })
  if (conflict) {
    const error = new AppError("this availability conflicts with another availability", 400, FAIL)
    return next(error)
  }

  const updatedAvailability = await availability.updateOne({...req.body})
  return res.json({status: SUCCESS, data: {updatedAvailability}})
})

const getDoctorAvailability = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  const availabilities = await Availability.find({ doctor: doctor._id })
  return res.json({status: SUCCESS, data: {availabilities}})
})

const generateAvailableSlots = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params
  const { date } = req.query

  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  if (!date) {
    const error = new AppError("date is required", 400, FAIL)
    return next(error)
  }

  const selectedDate = new Date(date)
  if (isNaN(selectedDate.getTime())) {
    const error = new AppError("invaled date", 400, FAIL)
    return next(error)
  }

  const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" })
  const availability = await Availability.find({
    doctor: doctorId,
    dayOfWeek,
    isActive: true
  })

  if (!availability.length) {
    return res.json({status: SUCCESS, data: {
      date,
      dayOfWeek,
      slots: []
    }})
  }

  const slots = []
  availability.forEach(item => {
    let [startHour, startMinute] = item.startTime.split(":").map(Number)
    const [endHour, endMinute] = item.endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    while (currentMinutes + item.slotDuration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const minute = currentMinutes % 60
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      slots.push(time)
      currentMinutes += item.slotDuration
    }
  });
  return res.json({status: SUCCESS, data: {
      date,
      dayOfWeek,
      slots
    }})
})

export {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
  updateAvailability,
  getDoctorAvailability,
  generateAvailableSlots
}