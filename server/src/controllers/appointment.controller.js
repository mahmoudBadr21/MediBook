import Appointment from "../models/appointment.model.js";
import Availability from "../models/availability.model.js";
import Doctor from "../models/doctor.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";
import { appointmentStatus, CANCELLED } from "../utils/appointmentStatus.js"

const createAppointment = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser._id
  const { doctorId, date, startTime } = req.body

  const doctor = await Doctor.findById(doctorId)
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  if (!doctor.isVerified) {
    const error = new AppError("doctor is not verified", 400, FAIL)
    return next(error)
  }

  if (!date || !startTime) {
    const error = new AppError("date and startTime are required", 400, FAIL)
    return next(error)
  }

  const selectedDate = new Date(date)
  if (isNaN(selectedDate.getTime())) {
    const error = new AppError("invalid date", 400, FAIL)
    return next(error)
  }

  // 2. منع الحجز في تاريخ ماضي (Past Date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const appointmentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

  if (appointmentDate < today) {
    const error = new AppError("cannot book an appointment in the past", 400, FAIL)
    return next(error)
  }

  // 3. منع حجز شريحة زمنية مرت بالفعل اليوم (Past Slot)
  const [reqHour, reqMinute] = startTime.split(":").map(Number)
  if (isNaN(reqHour) || isNaN(reqMinute)) {
    const error = new AppError("invalid time format, use HH:mm", 400, FAIL)
    return next(error)
  }

  const isToday = appointmentDate.getTime() === today.getTime()
  if (isToday) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const requestedMinutes = reqHour * 60 + reqMinute

    if (requestedMinutes <= currentMinutes) {
      const error = new AppError("cannot book a slot that has already passed today", 400, FAIL)
      return next(error)
    }
  }

  // 4. التحقق من جدول إتاحة الطبيب
  const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" })
  const availability = await Availability.find({
    doctor: doctorId,
    dayOfWeek,
    isActive: true
  })

  let selectedAvailability = null

  for (const item of availability) {
    let [startHour, startMinute] = item.startTime.split(":").map(Number)
    const [endHour, endMinute] = item.endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    while (currentMinutes + item.slotDuration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const minute = currentMinutes % 60
      const slot = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

      if (slot === startTime) {
        selectedAvailability = item
        break
      }
      currentMinutes += item.slotDuration
    }
    if (selectedAvailability) break
  }

  if (!selectedAvailability) {
    const error = new AppError("invalid appointment time", 400, FAIL)
    return next(error)
  }

  // 5. التحقق من عدم التعارض قبل الحفظ (Double Booking Check)
  const existingAppointment = await Appointment.findOne({
    doctorId: doctorId,
    date: appointmentDate,
    startTime,
    status: { $ne: "cancelled" }
  })

  if (existingAppointment) {
    const error = new AppError("this slot is already booked", 400, FAIL)
    return next(error)
  }

  // 6. إنشاء الحجز مع معالجة حماية الـ Unique Index في قاعدة البيانات
  try {
    const appointment = await Appointment.create({
      userId: patientId, // مطابقة اسم الحقل في الـ Index
      doctorId: doctorId,
      date: appointmentDate,
      startTime,
      duration: selectedAvailability.slotDuration
    })

    res.status(201).json({
      status: SUCCESS,
      data: {
        appointment
      }
    })
  } catch (err) {
    // التقاط خطأ الـ Unique Index لمنع الحجز المزدوج في حالة الطلبات المتزامنة (Race Condition)
    if (err.code === 11000) {
      const error = new AppError("this slot has just been booked by another user", 400, FAIL)
      return next(error)
    }
    return next(err)
  }
})

const getMyAppointments = asyncWrapper(async(req, res) => {
  const patientId = req.currentUser._id
  const appointments = await Appointment.find({userId: patientId}).populate("doctorId")
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments
    }
  })
})

const getDoctorAppointments = asyncWrapper(async(req, res, next) => {
  const doctorId = req.currentUser._id
  const doctor = await Doctor.findOne({userId: doctorId})
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  const appointments = await Appointment.find({doctorId}).populate("userId")
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments
    }
  })
})

const cancelAppointment = asyncWrapper(async(req, res, next) => {
  const { appointmentId } = req.params
  const appointment = await Appointment.findById(appointmentId)
  if (!appointment) {
    const error = new AppError("appointment not found", 404, FAIL)
    return next(error)
  }

  const patientId = req.currentUser._id
  if (!appointment.userId.equals(patientId)) {
    const error = new AppError("this appointment does not belong to this patient", 401, FAIL)
    return next(error)
  }

  if (appointment.status != CANCELLED) {
    const error = new AppError("this appointment is already cancelled", 401, FAIL)
    return next(error)
  }

  appointment.status = CANCELLED
  await appointment.save()

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointment
    }
  })
})

const updateAppointmentStatus = asyncWrapper(async(req, res, next) => {
  const { appointmentId } = req.params
  const appointment = await Appointment.findById(appointmentId)
  if (!appointment) {
    const error = new AppError("appointment not found", 404, FAIL)
    return next(error)
  }

  const userId = req.currentUser._id
  const doctor = await Doctor.findOne({userId})
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL)
    return next(error)
  }

  if (!appointment.doctorId.equals(doctor._id)) {
    const error = new AppError("appointment does not belong to this doctor", 401, FAIL)
    return next(error)
  }

  const { status } = req.body
  const validStatus = Object.values(appointmentStatus)
  if (!validStatus.includes(status)) {
    const error = new AppError("status not valid", 401, FAIL)
    return next(error)
  }

  appointment.status = status
  await appointment.save()
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointment
    }
  })
})

export {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  updateAppointmentStatus
}