import express from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { allowedTo } from '../middlewares/allowedTo.js'
import { userRoles } from '../utils/userRoles.js'

const router = express.Router()

router.route("/dashboardStats")
  .get(verifyToken, allowedTo(userRoles.ADMIN), dashboardController.getDashboardStats)

export { router }