import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {connectDB} from "./config/db.js";
import { Authrouter } from "./routes/auth.js";
import { SystemRouter } from "./routes/System.js";
import { ScanRouter } from "./routes/scan.js";
import { ChatRouter } from "./routes/chat.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/auth",Authrouter);
app.use("/Ai",ChatRouter);
app.use("/security", ScanRouter);
app.use("/system", SystemRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
