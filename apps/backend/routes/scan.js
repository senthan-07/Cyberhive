import express from "express";
import { getIp, scanNetwork } from "../Controller/Scan.js";

const ScanRouter = express.Router();
ScanRouter.post("/scan", scanNetwork);
ScanRouter.get("/ip",getIp);

export {ScanRouter};