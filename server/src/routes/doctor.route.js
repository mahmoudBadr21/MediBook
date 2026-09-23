import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { validateObjectId } from '../middlewares/validateObjectId.js'

const router = Router()

router.get("/", doctorController.getAllDoctor);

router.get(
  "/doctorProfile",
  verifyToken,
  allowedTo(userRoles.DOCTOR),
  doctorController.getMyProfile,
);

router.get("/search", doctorController.searchDoctors);

router.get("/:doctorId/getDoctor", validateObjectId("doctorId"), doctorController.getDoctorById);

router.delete(
  "/:doctorId/deleteDoctor",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  validateObjectId("doctorId"),
  doctorController.deleteDoctor,
);

router.patch(
  "/:userId/activate",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  validateObjectId("userId"),
  doctorController.activateDoctor,
);

router.patch(
  "/:doctorId/updateDoctor",
  verifyToken,
  allowedTo(userRoles.DOCTOR),
  validateObjectId("doctorId"),
  doctorController.updateDoctor,
);

router.patch(
  "/:doctorId/verifyDoctor",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  validateObjectId("doctorId"),
  doctorController.verifyDoctor,
);

export { router }