import express, {Request, Response, NextFunction} from "express";
import cookieParser from "cookie-parser";
import {logger} from "../../packages/middlewares/index.ts";
import mongoose from "mongoose";
import { APIResponse } from "../../packages/types/index.ts";
import projectRoutes from "./routes/projectRoutes.ts";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

const PORT = process.env.PORT || 6000;
mongoose.connect(process.env.MONGO_URI as string).then(() => {
    app.listen(PORT, () => console.log(`Project Service running on port ${PORT}`));
})
.catch((err) => console.log("MongoDB connection failed ", err));

app.use("/api/projects", projectRoutes);

app.use((err: any, req: Request, res: any, next: NextFunction) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });
    
    const statusCode = err.statusCode || 500;
    let apiResponse: APIResponse = {
        success: false,
        message: err.message || "It's a fault from our side. Hold tight :innocent: !",
    }

    res.status(statusCode).json(apiResponse);
});

