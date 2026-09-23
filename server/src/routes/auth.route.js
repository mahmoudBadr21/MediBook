import { Router } from "express";
import * as usersController from "../controllers/auth.controller.js";
import { registerValidation } from "../middlewares/registerValidation.js";
import { loginValidation } from "../middlewares/loginValidation.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { allowedTo } from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";

const router = Router();

router.get(
  "/users",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  usersController.getAllUsers,
);

router.get("/me", verifyToken, usersController.getMe);

router.post("/register", registerValidation(), usersController.register);

router.post("/login", loginValidation(), usersController.login);

router.post("/logout", verifyToken, usersController.logout);

router.post("/changePassword", verifyToken, usersController.changePassword);

router.patch(
  "/updateRole",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  usersController.updateRole,
);

export { router };