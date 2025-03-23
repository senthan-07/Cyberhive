import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true }, // e.g., "LOGIN_ATTEMPT", "DB_ERROR", "PERMISSION_DENIED"
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional User reference
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Add index to improve search performance
systemLogSchema.index({ event: 1, severity: 1, timestamp: -1 });

const SystemLog = mongoose.model("SystemLog", systemLogSchema);

export {SystemLog};
