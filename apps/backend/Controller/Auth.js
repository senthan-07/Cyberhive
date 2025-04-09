import { User } from "@repo/db/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Temp in-memory store for MFA codes (use Redis in production)
const mfaStore = new Map();

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMfaCode = async (to, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your MFA Code",
    text: `Your verification code is: ${code}`,
  });
};

// SIGNUP
const signupHandler = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedpass = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedpass, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error signing up user" });
  }
};

// SIGNIN — Step 1 (password check + send MFA)
const signinHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    mfaStore.set(email, { code, expiresAt });

    await sendMfaCode(email, code);

    res.json({ message: "MFA code sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

// MFA VERIFICATION — Step 2 (verify code and send JWT)
const verifyMfaHandler = async (req, res) => {
  try {
    const { email, code } = req.body;
    const entry = mfaStore.get(email);
    if (!entry) return res.status(400).json({ error: "MFA not initiated" });

    if (entry.code !== code || Date.now() > entry.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired MFA code" });
    }

    mfaStore.delete(email); // Cleanup

    const user = await User.findOne({ email });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "MFA verification failed" });
  }
};

export { signupHandler, signinHandler, verifyMfaHandler };
