import express from "express"
import * as usersController from '../controllers/auth.controller.js'
import { registerValidation } from '../middlewares/registerValidation.js'
import { loginValidation } from '../middlewares/loginValidation.js'
import { verifyToken } from "../middlewares/verifyToken.js"
import { allowedTo } from "../middlewares/allowedTo.js"
import { userRoles } from "../utils/userRoles.js"

const router = express.Router()

router.route("/")
  .get(allowedTo(userRoles.ADMIN), verifyToken, usersController.getAllUsers)

router.route("/register")
  .post(registerValidation(), usersController.register)

router.route("/login")
  .post(loginValidation(), usersController.login)

router.route("/logout")
  .post(verifyToken, usersController.logout)

router.route("/me")
  .get(verifyToken, usersController.getMe)

export { router }