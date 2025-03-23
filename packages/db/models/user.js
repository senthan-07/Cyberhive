import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { collection: "users" } // Ensure Mongoose uses the correct collection
);

// Prevent Mongoose from redefining the model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export { User };
