import { Router } from "express";
import * as availabilityController from "../controllers/availability.controller.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { availabilityValidation } from "../middlewares/availabilityValidation.js";
import { validateObjectId } from '../middlewares/validateObjectId.js'

const router = Router();

router.post(
  "/createAvailability",
  verifyToken,
  allowedTo(userRoles.ADMIN, userRoles.DOCTOR),
  availabilityValidation(),
  availabilityController.createAvailability,
);

router.get(
  "/myAvailability",
  verifyToken,
  allowedTo(userRoles.DOCTOR),
  availabilityController.getMyAvailability,
);

router.get("/:doctorId", validateObjectId("doctorId"), availabilityController.getDoctorAvailability);

router.get("/:doctorId/slots", validateObjectId("doctorId"), availabilityController.generateAvailableSlots);

router.route("/:availabilityId")
  .delete(
    verifyToken,
    allowedTo(userRoles.DOCTOR),
    validateObjectId("availabilityId"),
    availabilityController.deleteAvailability,
  )

  .patch(
    verifyToken,
    allowedTo(userRoles.DOCTOR),
    validateObjectId("availabilityId"),
    availabilityController.updateAvailability,
  );

export { router };
