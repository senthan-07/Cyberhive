import express from "express";
import { IDSHandler } from "../Controller/ids.js";

const IRouter = express.Router();
IRouter.post("/monitor", IDSHandler);

export {IRouter};