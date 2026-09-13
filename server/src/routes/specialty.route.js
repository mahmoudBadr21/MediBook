import { Router } from "express";
import * as specialtyController from "../controllers/specialty.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";

const router = Router()

router.route("/")
  .get(specialtyController.getAllSpecialty)

router.route("/:specialtyId")
  .get(specialtyController.getSpecialty)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), specialtyController.deleteSpecialty)
  .patch(verifyToken, allowedTo(userRoles.ADMIN), specialtyController.updateSpecialty)

router.route("/addSpecialty")
  .post(verifyToken, allowedTo(userRoles.ADMIN), specialtyController.addSpecialty)

export { router }