import express from "express";
import { signinHandler , signupHandler } from "../Controller/Auth.js";

const Authrouter = express.Router();
Authrouter.post("/signup",signupHandler);
Authrouter.post("/signin",signinHandler);

export {Authrouter};