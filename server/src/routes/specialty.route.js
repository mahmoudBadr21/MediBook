import { Router } from "express";
import * as specialtyController from "../controllers/specialty.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import { validateObjectId } from '../middlewares/validateObjectId.js'

const router = Router();

router.get("/", specialtyController.getAllSpecialty);

router.post("/addSpecialty",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  specialtyController.addSpecialty,
);
router.route("/:specialtyId")
  .get(validateObjectId("specialtyId"), specialtyController.getSpecialty)

  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    validateObjectId("specialtyId"),
    specialtyController.deleteSpecialty,
  )
  .patch(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    validateObjectId("specialtyId"),
    specialtyController.updateSpecialty,
  );

export { router };