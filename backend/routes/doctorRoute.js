// import express from "express";
// import {
//   appointmentCancel,
//   appointmentComplete,
//   appointmentsDoctor,
//   doctorDashboard,
//   doctorProfile,
//   doctorsList,
//   loginDoctor,
//   updateDoctorProfile,
// } from "../controllers/doctorController.js";
// import authDoctor from "../middleware/authDoctor.js";

// const doctorRouter = express.Router();

// doctorRouter.get("/list", doctorsList);
// doctorRouter.post("/login", loginDoctor);
// doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
// doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
// doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
// doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
// doctorRouter.get("/profile", authDoctor, doctorProfile);
// doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

// export default doctorRouter;

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor Panel APIs
 */

import express from "express";
import {
  appointmentCancel,
  appointmentComplete,
  appointmentsDoctor,
  doctorDashboard,
  doctorProfile,
  doctorsList,
  loginDoctor,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

/**
 * @swagger
 * /api/doctor/list:
 *   get:
 *     summary: List doctors (public)
 *     tags: [Doctor]
 *     responses:
 *       200: { description: Doctors list }
 */
doctorRouter.get("/list", doctorsList);

/**
 * @swagger
 * /api/doctor/login:
 *   post:
 *     summary: Doctor login
 *     tags: [Doctor]
 *     responses:
 *       200: { description: Doctor logged in }
 */
doctorRouter.post("/login", loginDoctor);

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Get doctor appointments
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 *     responses:
 *       200: { description: Doctor appointments }
 */
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);

/**
 * @swagger
 * /api/doctor/complete-appointment:
 *   post:
 *     summary: Mark appointment completed
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 */
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);

/**
 * @swagger
 * /api/doctor/cancel-appointment:
 *   post:
 *     summary: Cancel appointment (Doctor)
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 */
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);

/**
 * @swagger
 * /api/doctor/dashboard:
 *   get:
 *     summary: Doctor dashboard
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 */
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Doctor profile
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 */
doctorRouter.get("/profile", authDoctor, doctorProfile);

/**
 * @swagger
 * /api/doctor/update-profile:
 *   post:
 *     summary: Update doctor profile
 *     tags: [Doctor]
 *     security:
 *       - DoctorAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fees:
 *                 type: number
 *                 example: 500
 *               available:
 *                 type: boolean
 *                 example: true
 *               address:
 *                 type: object
 *                 properties:
 *                   line:
 *                     type: string
 *                     example: "MG Road"
 *                   line2:
 *                     type: string
 *                     example: "Bangalore"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;
