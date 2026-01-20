import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import redis from "../config/redis.js";

import { publishEvent } from "../utils/eventPublisher.js";

//API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exist" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }
    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating new user
    const userData = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    //saving user in database
    const newUser = new userModel(userData);
    const user = await newUser.save();

    //generating token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    //returning token
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    //validating the user
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    //validating the password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get user Profile Data
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `user:profile:${userId}`;

    // 1. Check cache
    const cachedProfile = await redis.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        userData: JSON.parse(cachedProfile),
        source: "cache",
      });
    }

    // 2. Original logic (UNCHANGED)
    const userData = await userModel.findById(userId).select("-password");

    // 3. Save to cache
    await redis.set(
      cacheKey,
      JSON.stringify(userData),
      "EX",
      60 * 10 // 10 minutes
    );

    res.json({
      success: true,
      userData,
      source: "db",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    //update user data
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    await redis.del(`user:profile:${userId}`);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to book appointment
const bookAppointment = async (req, res) => {
  const userId = req.user.userId;
  const { docId, slotDate, slotTime } = req.body;

  const lockKey = `lock:slot:${docId}:${slotDate}:${slotTime}`;
  const slotCacheKey = `doctor:slots:${docId}:${slotDate}`;

  let lockAcquired = false;

  try {
    // 1️⃣ Acquire distributed lock (prevents double booking)
    lockAcquired = await redis.set(
      lockKey,
      "locked",
      "NX", // only set if not exists
      "EX",
      10 // auto-release after 10s (safety)
    );

    if (!lockAcquired) {
      return res.json({
        success: false,
        message: "Slot is being booked, please try again",
      });
    }

    // 2️⃣ Fetch doctor data (UNCHANGED)
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not Available",
      });
    }

    let slots_booked = docData.slots_booked;

    // 3️⃣ Try Redis cache for slot availability
    const cachedSlots = await redis.get(slotCacheKey);
    if (cachedSlots) {
      slots_booked[slotDate] = JSON.parse(cachedSlots);
    }

    // 4️⃣ ORIGINAL slot availability logic (UNCHANGED)
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot not Available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    // 5️⃣ Fetch user data (UNCHANGED)
    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    };

    // 6️⃣ Save appointment (UNCHANGED)
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // 7️⃣ Update doctor slots in DB (UNCHANGED)
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // 8️⃣ Update Redis slot cache (short TTL)
    await redis.set(
      slotCacheKey,
      JSON.stringify(slots_booked[slotDate]),
      "EX",
      60
    );

    // 9️⃣ Publish event (UNCHANGED)
    await publishEvent("APPOINTMENT_BOOKED", {
      entityId: newAppointment._id,
      userId,
      doctorId: docId,
      payload: {
        userEmail: userData.email,
        userName: userData.name,
        doctorName: docData.name,
        slotDate,
        slotTime,
        amount: docData.fees,
      },
    });

    // 🔟 Invalidate user appointments cache
    await redis.del(`user:appointments:${userId}`);

    res.json({
      success: true,
      message: "Appointment Booked",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  } finally {
    // 🔓 Always release lock
    if (lockAcquired) {
      await redis.del(lockKey);
    }
  }
};

export default bookAppointment;

//API to get user appointment for frontend
const listAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `user:appointments:${userId}`;

    // 1. Check cache
    const cachedAppointments = await redis.get(cacheKey);
    if (cachedAppointments) {
      return res.json({
        success: true,
        appointments: JSON.parse(cachedAppointments),
        source: "cache",
      });
    }

    // 2. Original logic (UNCHANGED)
    const appointments = await appointmentModel.find({ userId });

    // 3. Save to cache (SHORT TTL)
    await redis.set(
      cacheKey,
      JSON.stringify(appointments),
      "EX",
      30 // 30 seconds
    );

    res.json({
      success: true,
      appointments,
      source: "db",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    //verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    //update appointment status to cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    await redis.del(`user:appointments:${userId}`);

    await publishEvent("APPOINTMENT_CANCELLED", {
      entityId: appointmentId,
      userId: appointmentData.userId,
      doctorId: appointmentData.docId,
      payload: {
        userEmail: appointmentData.userData.email,
        userName: appointmentData.userData.name,
        doctorName: appointmentData.docData.name,
        slotDate: appointmentData.slotDate,
        slotTime: appointmentData.slotTime,
        cancelledBy: "USER",
      },
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//razorpay instance
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not Found",
      });
    }

    //razorpay payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Verify Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      const appointmentData = await appointmentModel.findById(
        orderInfo.receipt
      );

      await publishEvent("PAYMENT_SUCCESS", {
        entityId: appointmentData._id,
        userId: appointmentData.userId,
        doctorId: appointmentData.docId,
        payload: {
          userEmail: appointmentData.userData.email,
          userName: appointmentData.userData.name,
          doctorName: appointmentData.docData.name,
          slotDate: appointmentData.slotDate,
          slotTime: appointmentData.slotTime,
          amount: appointmentData.amount,
        },
      });

      await redis.del(`doctor:dashboard:${appointmentData.docId}`);
      await redis.del("admin:dashboard");
      await redis.del(`user:appointments:${appointmentData.userId}`);

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
