import express from "express";
import { scanNetwork } from "../Controller/Scan.js";

const ScanRouter = express.Router();
ScanRouter.post("/scan", scanNetwork);

export {ScanRouter};