import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // MONGO_URI must be in your .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
