import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { validateObjectId } from '../middlewares/validateObjectId.js'

const router = Router();

router.get(
  "/myAppointments",
  verifyToken,
  allowedTo(userRoles.PATIENT),
  appointmentController.getMyAppointments,
);

router.get(
  "/doctorAppointments",
  verifyToken,
  allowedTo(userRoles.DOCTOR),
  appointmentController.getDoctorAppointments,
);
router.post("/create", verifyToken, appointmentController.createAppointment);

router.patch(
  "/cancel/:appointmentId",
  verifyToken,
  validateObjectId("appointmentId"),
  appointmentController.cancelAppointment,
);

router.patch(
  "/update/:appointmentId",
  verifyToken,
  allowedTo(userRoles.DOCTOR),
  validateObjectId("appointmentId"),
  appointmentController.updateAppointmentStatus,
);

export { router };