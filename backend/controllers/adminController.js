import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import redis from "../config/redis.js";
import { publishEvent } from "../utils/eventPublisher.js";

//API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    //checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validating password length
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);

    await newDoctor.save();

    await redis.del("admin:dashboard");
    await redis.del("doctors:list");

    res.json({
      success: true,
      message: "Doctor Added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get all appointment list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    // const userId = req.user.userId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

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

    await redis.del("admin:dashboard");
    await redis.del(`doctor:slots:${docId}:${slotDate}`);

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
        cancelledBy: "ADMIN",
      },
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get Dashboard data for admin Panel
const adminDashboard = async (req, res) => {
  try {
    const cacheKey = "admin:dashboard";

    // 1. Check cache
    const cachedDashboard = await redis.get(cacheKey);
    if (cachedDashboard) {
      return res.json({
        success: true,
        dashData: JSON.parse(cachedDashboard),
        source: "cache",
      });
    }

    // 2. Original logic (UNCHANGED)
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    // 3. Save to Redis (SHORT TTL)
    await redis.set(
      cacheKey,
      JSON.stringify(dashData),
      "EX",
      60 // 60 seconds
    );

    res.json({
      success: true,
      dashData,
      source: "db",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
