import express from "express";
import { getLogs } from "../Controller/System.js";

const SystemRouter = express.Router();
SystemRouter.get("/logs", getLogs);

export {SystemRouter};