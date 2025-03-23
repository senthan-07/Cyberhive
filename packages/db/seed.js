import mongoose from "mongoose";
import { SystemLog } from "./models/Systemlog.js";
import { User } from "./models/user.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedLogs() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB...");
    await User.deleteMany({}); 
    await SystemLog.deleteMany({}); 
    console.log("Old data removed.");

    
    const users = await User.insertMany([
      { username: "alice", email: "alice@example.com", password: "password123", role: "admin" },
      { username: "boby", email: "bob@example.com", password: "password123", role: "user" },
    ]);
    console.log("Dummy users added.");

    
    const logs = [
      { event: "SERVER_STARTED", severity: "low" },
      { event: "DB_CONNECTION_ERROR", severity: "high" },
      { event: "UNAUTHORIZED_ACCESS", severity: "medium" }
    ];

    await SystemLog.insertMany(logs);
    console.log("Dummy logs added.");

    mongoose.disconnect();
  } catch (error) {
    console.error("Seeding failed:", error);
    mongoose.disconnect();
  }
}

seedLogs();
