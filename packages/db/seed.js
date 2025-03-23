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
      {
        event: "SCAN_STARTED",
        severity: "low",
        ipAddress: "192.168.1.10",
        scannedPorts: [],
        securityScore: null,
        anomalyDetected: false,
      },
      {
        event: "PORT_OPEN",
        severity: "medium",
        ipAddress: "192.168.1.10",
        scannedPorts: [{ port: 22, service: "SSH", risk: "high" }],
        securityScore: 90,
        anomalyDetected: false,
      },
      {
        event: "MALICIOUS_ACTIVITY",
        severity: "high",
        ipAddress: "192.168.1.50",
        scannedPorts: [
          { port: 445, service: "SMB", risk: "high" },
          { port: 3389, service: "RDP", risk: "high" },
        ],
        securityScore: 70,
        anomalyDetected: true,
      },
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
