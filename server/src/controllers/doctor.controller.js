import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";
import { userRoles } from "../utils/userRoles.js";

const activateDoctor = asyncWrapper(async(req, res, next) => {
  const { userId } = req.params
  const user = await User.findById(userId)
  if (!user) {
    const error = new AppError("user not found", 404, FAIL)
    return next(error)
  }

  const lastRole = user.role
  if (lastRole != userRoles.PATIENT) {
    const error = new AppError("user must be patient first", 400, FAIL)
    return next(error)
  }

  if (lastRole == userRoles.DOCTOR) {
    const error = new AppError("user is already doctor", 400, FAIL)
    return next(error)
  }

  user.role = userRoles.DOCTOR
  await user.save()
  const doctor = await Doctor.create({
    userId: user._id
  })

  return res.json({status: SUCCESS, data: {user, doctor}})
})

const getAllDoctor = asyncWrapper(async(req, res, next) => {
  const doctors = await Doctor.find({}, {"__v": false})
  return res.json({status: SUCCESS, data: {doctors}})
})

const getDoctorById = asyncWrapper(async(req, res, next) => {
  const {doctorId} = req.params
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  return res.json({status: SUCCESS, data: {doctor}})
})

const getMyProfile = asyncWrapper(async(req, res, next) => {
  const doctorId = req.currentUser._id
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  return res.json({status: SUCCESS, data: {doctor}})
})

const deleteDoctor = asyncWrapper(async(req, res, next) => {
  const {doctorId} = req.params
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  if (doctor.role != userRoles.DOCTOR) {
    const error = new AppError("this user is not a doctor", 404, FAIL)
    return next(error)
  }

  await doctor.deleteOne()
  return res.json({status: SUCCESS, data: null})
})

const updateDoctor = asyncWrapper(async(req, res, next) => {
  const {doctorId} = req.params
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  if (doctor.role != userRoles.DOCTOR) {
    const error = new AppError("this user is not a doctor", 404, FAIL)
    return next(error)
  }

  const updatedDoctor = await doctor.updateOne({...req.body})
  return res.json({status: SUCCESS, data: {updatedDoctor}})
})

const verifyDoctor = asyncWrapper(async(req, res, next) => {
  const {doctorId} = req.params
  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("user not found", 404, FAIL)
    return next(error)
  }

  if (doctor.role != userRoles.DOCTOR) {
    const error = new AppError("this user is not a doctor", 404, FAIL)
    return next(error)
  }

  if(doctor.isVerified) {
    const error = new AppError("this doctor is not already verify", 404, FAIL)
    return next(error)
  }

  doctor.isVerified = true
  await doctor.save()

  return res.json({status: SUCCESS, data: {doctor}})
})

export {
  activateDoctor,
  getAllDoctor,
  getDoctorById,
  getMyProfile,
  deleteDoctor,
  updateDoctor,
  verifyDoctor
}