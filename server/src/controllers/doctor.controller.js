import Doctor from "../models/doctor.model.js";
import Specialty from "../models/specialty.model.js";
import User from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { FAIL, SUCCESS } from "../utils/httpSatutsText.js";
import { userRoles } from "../utils/userRoles.js";

const activateDoctor = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("user not found", 404, FAIL);
    return next(error);
  }

  const lastRole = user.role;
  if (lastRole != userRoles.PATIENT) {
    const error = new AppError("user must be patient first", 400, FAIL);
    return next(error);
  }

  if (lastRole == userRoles.DOCTOR) {
    const error = new AppError("user is already doctor", 400, FAIL);
    return next(error);
  }

  user.role = userRoles.DOCTOR;
  await user.save();
  const doctor = await Doctor.create({
    userId: user._id,
  });

  return res.json({ status: SUCCESS, data: { user, doctor } });
});

const getAllDoctor = asyncWrapper(async (req, res, next) => {
  const { specialty } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    isVerified: true,
  };
  if (specialty) {
    filter.specialty = new mongoose.Types.ObjectId(specialty);
  }

  const doctors = await Doctor.find({ filter }, { __v: false })
    .populate("userId")
    .populate("specialtyId")
    .skip(skip)
    .limit(limit);

  const totalDoctors = await Doctor.countDocuments(filter);
  return res.json({
    status: SUCCESS,
    data: {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(totalDoctors / limit),
      },
    },
  });
});

const getDoctorById = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params;
  const doctor = await Doctor.findById(doctorId)
    .populate("userId")
    .populate("specialtyId");
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  return res.json({ status: SUCCESS, data: { doctor } });
});

const getMyProfile = asyncWrapper(async (req, res, next) => {
  const doctorId = req.currentUser.id;
  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  return res.json({ status: SUCCESS, data: { doctor } });
});

const deleteDoctor = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  await doctor.deleteOne();
  return res.json({ status: SUCCESS, data: null });
});

const updateDoctor = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    const error = new AppError("doctor not found", 404, FAIL);
    return next(error);
  }

  if (!doctor.specialtyId) {
    const { specialtyId } = req.body;
    if (!specialtyId) {
      const error = new AppError("specialty required", 400, FAIL);
      return next(error);
    }
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      const error = new AppError("specialty not found", 404, FAIL);
      return next(error);
    }
  }

  const updatedDoctor = await Doctor.findOneAndUpdate(
    doctor._id,
    { $set: { ...req.body } },
    { returnDocument: "after", runValidators: true },
  );
  return res.json({ status: SUCCESS, data: { updatedDoctor } });
});

const verifyDoctor = asyncWrapper(async (req, res, next) => {
  const { doctorId } = req.params;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    const error = new AppError("user not found", 404, FAIL);
    return next(error);
  }

  if (doctor.isVerified) {
    const error = new AppError("this doctor is not already verify", 400, FAIL);
    return next(error);
  }

  doctor.isVerified = true;
  await doctor.save();

  return res.json({ status: SUCCESS, data: { doctor } });
});

const searchDoctors = asyncWrapper(async (req, res, next) => {
  const { search } = req.query;
  if (!search) {
    const error = new AppError("Search query is required", 400, FAIL);
    return next(error);
  }

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
    ],
    role: "DOCTOR",
  }).select("_id");

  const userIds = users.map((user) => user._id);

  const doctors = await Doctor.find({
    userId: { $in: userIds },
    isVerified: true,
  })
    .populate("userId", "firstName lastName email")
    .populate("specialtyId");
  return res.status(200).json({
    status: SUCCESS,
    data: {
      doctors,
    },
  });
});

export {
  activateDoctor,
  getAllDoctor,
  getDoctorById,
  getMyProfile,
  deleteDoctor,
  updateDoctor,
  verifyDoctor,
  searchDoctors
};
