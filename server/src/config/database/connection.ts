import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  console.log('Database starting to connect...');
  try {
    const dbUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/synxcalz";
    await mongoose.connect(dbUrl);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDatabase;