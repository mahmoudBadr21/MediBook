import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Specialty from "../models/specialty.model.js";
import User from "../models/user.model.js";
import { appointmentStatus } from "../utils/appointmentStatus.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { SUCCESS } from "../utils/httpSatutsText.js";
import { userRoles } from "../utils/userRoles.js";

const getDashboardStats = asyncWrapper (async (req, res, next) => {
  const totalUsers = await User.countDocuments()
  const totalDoctors = await Doctor.countDocuments()
  const verifiedDoctors = await Doctor.countDocuments({ isVerified : true })
  const totalPatients = await User.countDocuments({ role : userRoles.PATIENT })
  const totalAppointments = await Appointment.countDocuments()
  const pendingAppointments = await Appointment.countDocuments({ status : appointmentStatus.PENDING })
  const confirmedAppointments = await Appointment.countDocuments({ status : appointmentStatus.CONFIMED })
  const completedAppointments = await Appointment.countDocuments({ status : appointmentStatus.COMPLETED })
  const cancelledAppointments = await Appointment.countDocuments({ status : appointmentStatus.CANCELLED })
  const totalSpecialties = await Specialty.countDocuments()
  res.status(200).json({
    satuts: SUCCESS,
    data: {
    stats: {
      totalUsers,
      totalDoctors,
      verifiedDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalSpecialties
    }
  }});
})

export {
  getDashboardStats
}