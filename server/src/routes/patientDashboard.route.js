import { Router } from "express";
import * as patientDashboardController from "../controllers/patientDashboard.controller.js";

const router = Router()

router.get("/patientAppointments", patientDashboardController.patientAppointments)
router.get("/pendingAppointments", patientDashboardController.pendingAppointments)
router.get("/confirmedAppointments", patientDashboardController.confirmedAppointments)
router.get("/cancelledAppointments", patientDashboardController.cancelledAppointments)
router.get("/completedAppointments", patientDashboardController.completedAppointments)
router.get("/todayAppointments", patientDashboardController.todayAppointments)
router.get("/upcomingAppointments", patientDashboardController.upcomingAppointments)

export { router }