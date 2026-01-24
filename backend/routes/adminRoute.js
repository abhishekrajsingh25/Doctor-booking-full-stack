// import express from "express";
// import upload from "../middleware/multer.js";
// import {
//   addDoctor,
//   adminDashboard,
//   allDoctors,
//   appointmentCancel,
//   appointmentsAdmin,
//   loginAdmin,
// } from "../controllers/adminController.js";
// import authAdmin from "../middleware/authAdmin.js";
// import { changeAvailability } from "../controllers/doctorController.js";

// const adminRouter = express.Router();

// adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
// adminRouter.post("/login", loginAdmin);
// adminRouter.post("/all-doctors", authAdmin, allDoctors);
// adminRouter.post("/change-availability", authAdmin, changeAvailability);
// adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
// adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
// adminRouter.get("/dashboard", authAdmin, adminDashboard);

// export default adminRouter;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Panel APIs
 */

import express from "express";
import upload from "../middleware/multer.js";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
  loginAdmin,
} from "../controllers/adminController.js";
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 */
adminRouter.post("/login", loginAdmin);

/**
 * @swagger
 * /api/admin/add-doctor:
 *   post:
 *     summary: Add new doctor
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

/**
 * @swagger
 * /api/admin/all-doctors:
 *   post:
 *     summary: Get all doctors
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.post("/all-doctors", authAdmin, allDoctors);

/**
 * @swagger
 * /api/admin/change-availability:
 *   post:
 *     summary: Change doctor availability
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.post("/change-availability", authAdmin, changeAvailability);

/**
 * @swagger
 * /api/admin/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);

/**
 * @swagger
 * /api/admin/cancel-appointment:
 *   post:
 *     summary: Cancel appointment (Admin)
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin dashboard
 *     tags: [Admin]
 *     security:
 *       - AdminAuth: []
 */
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
