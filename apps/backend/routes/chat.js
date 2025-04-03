import express from "express";
import { ChatHandler } from "../Controller/Chat.js";

const ChatRouter = express.Router();
ChatRouter.post("/chat", ChatHandler);

export {ChatRouter};