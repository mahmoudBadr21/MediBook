import express from "express";
import * as appointmentController from '../controllers/appointment.controller.js'
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";

const router = express.Router()

router.route("/create")
  .post(verifyToken, appointmentController.createAppointment)

router.route("/myAppointments")
  .get(verifyToken, allowedTo(userRoles.PATIENT), appointmentController.getMyAppointments)

router.route("/doctorAppointments")
  .get(verifyToken, allowedTo(userRoles.DOCTOR), appointmentController.getDoctorAppointments)

router.route("/cancel/:appointmentId")
  .patch(verifyToken, appointmentController.cancelAppointment)

router.route("/update/:appointmentId")
  .patch(verifyToken, allowedTo(userRoles.DOCTOR), appointmentController.updateAppointmentStatus)

export { router }