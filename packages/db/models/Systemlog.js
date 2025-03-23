import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true }, // e.g., "SCAN_STARTED", "PORT_OPEN", "LOGIN_ATTEMPT"
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional User reference
    ipAddress: { type: String, required: false }, // Capture user/scanner IP
    scannedPorts: [
      {
        port: Number,
        service: String,
        risk: { type: String, enum: ["low", "medium", "high"] },
      },
    ], // Stores open ports & risks
    securityScore: { type: Number, required: false }, // Store security score from the scan
    anomalyDetected: { type: Boolean, default: false }, // Future AI anomaly detection
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔹 Add indexes for faster querying
systemLogSchema.index({ event: 1, severity: 1, timestamp: -1 });
systemLogSchema.index({ ipAddress: 1, timestamp: -1 });

const SystemLog = mongoose.model("SystemLog", systemLogSchema);

export { SystemLog };
