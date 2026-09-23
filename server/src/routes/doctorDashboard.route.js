import { Router } from "express";
import * as doctorDashboardController from "../controllers/doctorDashboard.controller.js";

const router = Router()

router.get("/doctorAppointments", doctorDashboardController.doctorAppointments)
router.get("/pendingAppointments", doctorDashboardController.pendingAppointments)
router.get("/confirmedAppointments", doctorDashboardController.confirmedAppointments)
router.get("/cancelledAppointments", doctorDashboardController.cancelledAppointments)
router.get("/completedAppointments", doctorDashboardController.completedAppointments)
router.get("/todayAppointments", doctorDashboardController.todayAppointments)
router.get("/upcomingAppointments", doctorDashboardController.upcomingAppointments)

export { router }