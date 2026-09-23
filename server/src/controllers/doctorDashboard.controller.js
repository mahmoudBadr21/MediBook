import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";
import { appointmentStatus } from "../utils/appointmentStatus.js";

const doctorAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({ doctorId }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const pendingAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({
    doctorId,
    status: appointmentStatus.PENDING,
  }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const confirmedAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({
    doctorId,
    status: appointmentStatus.CONFIMED,
  }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const cancelledAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({
    doctorId,
    status: appointmentStatus.CANCELLED,
  }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const completedAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }
  const appointments = await Appointment.find({
    doctorId,
    status: appointmentStatus.COMPLETED,
  }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const todayAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctorId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  });
  res.status(200).json({
    status: SUCCESS,
    data: {
      appointments,
    },
  });
});

const upcomingAppointments = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  const now = new Date();

  const appointments = await Appointment.find({
    doctorId,
    date: {
      $gte: now,
    },
  })
  .sort({ date: 1 })
  .populate({
    path: "doctorId",
    select: "userId",
    populate: {
      path: "userId",
      select: "firstName lastName email phone avatar",
    },
  })
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
  doctorAppointments,
  pendingAppointments,
  confirmedAppointments,
  completedAppointments,
  cancelledAppointments,
  todayAppointments,
  upcomingAppointments
};
