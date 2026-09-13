import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";

const router = Router()

router.route("/")
  .get(doctorController.getAllDoctor)

router.route("/:userId/activate")
  .patch(verifyToken, allowedTo(userRoles.ADMIN), doctorController.activateDoctor)

router.route("/:doctorId/getDoctor")
  .get(doctorController.getDoctorById)

router.route("/doctorProfile")
  .get(verifyToken, allowedTo(userRoles.DOCTOR), doctorController.getMyProfile)

router.route("/:doctorId/deleteDoctor")
  .delete(verifyToken, allowedTo(userRoles.ADMIN), doctorController.deleteDoctor)

router.route("/:doctorId/updateDoctor")
  .patch(verifyToken, allowedTo(userRoles.DOCTOR), doctorController.updateDoctor)

router.route("/:doctorId/verifyDoctor")
  .patch(verifyToken, allowedTo(userRoles.ADMIN), doctorController.verifyDoctor)

export { router }