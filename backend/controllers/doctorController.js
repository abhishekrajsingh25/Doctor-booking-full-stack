import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import redis from "../config/redis.js";
import { publishEvent } from "../utils/eventPublisher.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    await redis.del("doctors:list");

    res.json({ success: true, message: "Availablity Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorsList = async (req, res) => {
  try {
    const cacheKey = "doctors:list";

    // 1. Check cache
    const cachedDoctors = await redis.get(cacheKey);
    if (cachedDoctors) {
      return res.json({
        success: true,
        doctors: JSON.parse(cachedDoctors),
        source: "cache",
      });
    }

    // 2. Original logic (UNCHANGED)
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    // 3. Save to cache
    await redis.set(
      cacheKey,
      JSON.stringify(doctors),
      "EX",
      60 * 5 // 5 minutes
    );

    res.json({
      success: true,
      doctors,
      source: "db",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for Doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({
        success: false,
        message: "Invalid Email",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({
        success: false,
        message: "Invalid Passsword",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    // const docId = req.body;
    const docId = req.user.docId;

    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.user.docId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      // Update appointment status to completed
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      await redis.del(`doctor:dashboard:${docId}`);

      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.user.docId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      // Mark appointment as cancelled
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      await redis.del(`doctor:dashboard:${docId}`);

      await redis.del(`doctor:slots:${docId}:${appointmentData.slotDate}`);

      // Publish cancellation event
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
          cancelledBy: "DOCTOR",
        },
      });

      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get Dashboard Data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.user.docId;
    const cacheKey = `doctor:dashboard:${docId}`;

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
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
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

//API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const docId = req.user.docId;
    const cacheKey = `doctor:profile:${docId}`;

    // 1. Check Redis first
    const cachedProfile = await redis.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        profileData: JSON.parse(cachedProfile),
        source: "cache",
      });
    }

    // 2. Original logic (UNCHANGED)
    const profileData = await doctorModel.findById(docId).select("-password");

    // 3. Save to Redis
    await redis.set(
      cacheKey,
      JSON.stringify(profileData),
      "EX",
      60 * 10 // 10 minutes
    );

    res.json({
      success: true,
      profileData,
      source: "db",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to Update doctor profile for Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.user.docId;
    const { fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    await redis.del("doctors:list");
    await redis.del(`doctor:profile:${docId}`);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorsList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
