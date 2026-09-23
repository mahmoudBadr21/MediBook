import { Router } from "express";
import * as availabilityController from "../controllers/availability.controller.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { availabilityValidation } from "../middlewares/availabilityValidation.js";

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

router.get("/:doctorId", availabilityController.getDoctorAvailability);

router.get("/:doctorId/slots", availabilityController.generateAvailableSlots);

router.route("/:availabilityId")
  .delete(
    verifyToken,
    allowedTo(userRoles.DOCTOR),
    availabilityController.deleteAvailability,
  )
  .patch(
    verifyToken,
    allowedTo(userRoles.DOCTOR),
    availabilityController.updateAvailability,
  );

export { router };
