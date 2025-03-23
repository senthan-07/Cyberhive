import {User} from "@repo/db/models/user"; 
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
// console.log(User.schema);

const signupHandler = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedpass = await bcrypt.hash(password,10);
    const user = new User({ username, email, password : hashedpass, role });
    await user.save();    
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error signing up user" });
  }
};

const signinHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });    
    if (!user) return res.status(400).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};

export { signinHandler, signupHandler };
