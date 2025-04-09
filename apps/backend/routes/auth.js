import express from "express";
import { signinHandler , signupHandler , verifyMfaHandler } from "../Controller/Auth.js";

const Authrouter = express.Router();
Authrouter.post("/signup",signupHandler);
Authrouter.post("/signin", signinHandler);
Authrouter.post("/verify-mfa", verifyMfaHandler);

export {Authrouter};