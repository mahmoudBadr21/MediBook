import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";
import { appointmentStatus } from "../utils/appointmentStatus.js";

const patientAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const appointments = await Appointment.find({ userId: patientId })
  .populate("doctorId")
  .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const pendingAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({ userId: patientId, status: appointmentStatus.PENDING })
    .populate("doctorId")
    .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const confirmedAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const appointments = await Appointment.find({ userId: patientId, status: appointmentStatus.CONFIMED })
    .populate("doctorId")
    .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const cancelledAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const appointments = await Appointment.find({ userId: patientId, status: appointmentStatus.CANCELLED })
    .populate("doctorId")
    .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const completedAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const appointments = await Appointment.find({ userId: patientId, status: appointmentStatus.COMPLETED })
    .populate("doctorId")
    .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const todayAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({ userId: patientId, date: {
    $gte: startOfDay,
    $lte: endOfDay,
  }})
    .populate("doctorId")
    .populate("specialtyId");

  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const upcomingAppointments = asyncWrapper(async (req, res, next) => {
  const patientId = req.currentUser.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const patient = await User.findOne({ userId: patientId });
  if (!patient) {
    const error = new AppError("patient not found", 404, FAIL);
    return next(error);
  }

  const now = new Date();

  const appointments = await Appointment.find({ userId: patientId, date: {
    $gte: now,
  }})
    .sort({ date: 1 })
    .populate("doctorId")
    .populate("specialtyId")
    .skip(skip)
    .limit(limit);

  const totalAppointments = await Appointment.countDocuments({
    doctorId,
    date: {
      $gte: now,
    },
  });
  
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(totalAppointments / limit),
      },
    },
  });
});

export {
  patientAppointments,
  pendingAppointments,
  confirmedAppointments,
  completedAppointments,
  cancelledAppointments,
  todayAppointments,
  upcomingAppointments
};
