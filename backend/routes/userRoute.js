// import express from "express";
// import {
//   bookAppointment,
//   cancelAppointment,
//   getProfile,
//   listAppointment,
//   loginUser,
//   paymentRazorpay,
//   registerUser,
//   updateProfile,
//   verifyRazorpay,
// } from "../controllers/userController.js";
// import authUser from "../middleware/authUser.js";
// import upload from "../middleware/multer.js";

// const userRouter = express.Router();

// userRouter.post("/register", registerUser);
// userRouter.post("/login", loginUser);
// userRouter.get("/get-profile", authUser, getProfile);
// userRouter.post(
//   "/update-profile",
//   upload.single("image"),
//   authUser,
//   updateProfile
// );
// userRouter.post("/book-appointment", authUser, bookAppointment);
// userRouter.get("/appointments", authUser, listAppointment);
// userRouter.post("/cancel-appointment", authUser, cancelAppointment);
// userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
// userRouter.post("/verify-razorpay", authUser, verifyRazorpay);

// export default userRouter;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Patient/User APIs
 */

import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointment,
  loginUser,
  paymentRazorpay,
  registerUser,
  updateProfile,
  verifyRazorpay,
} from "../controllers/userController.js";
import authUser from "../middleware/authUser.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: User registered successfully }
 */
userRouter.post("/register", registerUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 */
userRouter.post("/login", loginUser);

/**
 * @swagger
 * /api/user/get-profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: User profile fetched }
 */
userRouter.get("/get-profile", authUser, getProfile);

/**
 * @swagger
 * /api/user/update-profile:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: Profile updated }
 */
userRouter.post("/update-profile", upload.single("image"), authUser, updateProfile);

/**
 * @swagger
 * /api/user/book-appointment:
 *   post:
 *     summary: Book an appointment
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               docId: { type: string }
 *               slotDate: { type: string }
 *               slotTime: { type: string }
 *     responses:
 *       200: { description: Appointment booked }
 */
userRouter.post("/book-appointment", authUser, bookAppointment);

/**
 * @swagger
 * /api/user/appointments:
 *   get:
 *     summary: List user appointments
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: Appointment list }
 */
userRouter.get("/appointments", authUser, listAppointment);

/**
 * @swagger
 * /api/user/cancel-appointment:
 *   post:
 *     summary: Cancel appointment (User)
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: Appointment cancelled }
 */
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

/**
 * @swagger
 * /api/user/payment-razorpay:
 *   post:
 *     summary: Create Razorpay order
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: Razorpay order created }
 */
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);

/**
 * @swagger
 * /api/user/verify-razorpay:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [User]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200: { description: Payment verified }
 */
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);

export default userRouter;
