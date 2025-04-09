import express from "express";
import { Vuln } from "../Controller/vuln.js";

const VulnRouter = express.Router();
VulnRouter.post("/vuln", Vuln);

export {VulnRouter};