import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/notification_service`);
    console.log("Notification DB Connected");
  } catch (error) {
    console.error("Mongo connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
