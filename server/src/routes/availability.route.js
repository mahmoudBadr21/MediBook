import { Router } from "express";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { availabilityValidation } from "../middlewares/availabilityValidation.js";
import * as availabilityController from "../controllers/availability.controller.js"

const router = Router()

router.route("/createAvailability")
  .post(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.DOCTOR),
    availabilityValidation(),
    availabilityController.createAvailability,
  );

router.route("/myAvailability")
  .get(verifyToken, allowedTo(userRoles.DOCTOR), availabilityController.getMyAvailability)

router.route("/:availabilityId")
  .delete(verifyToken, allowedTo(userRoles.DOCTOR), availabilityController.deleteAvailability)
  .patch(verifyToken, allowedTo(userRoles.DOCTOR), availabilityController.updateAvailability)

router.route("/:doctorId")
  .get(availabilityController.getDoctorAvailability)

router.route("/:doctorId/slots")
  .get(availabilityController.generateAvailableSlots)

export { router }