import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./models/user.ts";
import {COOKIES_EXPIRES_IN_DAYS, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, SALT_ROUNDS } from "./constants.ts";
import {logger} from "../../packages/middlewares/index.ts"
import { AuthRequest} from "./types/types.ts";
import { APIResponse } from "../../packages/types/index.ts";
import { registerServerSchema, loginSchema } from "../../packages/validators/index.ts";
import { isAuthenticated } from "../../packages/middlewares/index.ts";
import { daysToMS } from "./helpers/daysToMS.ts";
import {ApiError} from "../../packages/helpers/index.ts";
import cookieParser from "cookie-parser";
import { BAD_REQUEST_STATUS_CODE, OK_STATUS_CODE, CREATED_STATUS_CODE, UNAUTHORIZED_STATUS_CODE} from "../../packages/constants/index.ts";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI as string).then(() => {
    app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
})
.catch((err) => console.log("MongoDB connection failed ", err));

app.post("/api/auth/register", isAuthenticated as any, async (req: AuthRequest, res: any, next: NextFunction) => {
    
    try{
        const { name, email, password } = req.body;
        let apiResponse: APIResponse;
        const id = uuidv4();
        const newUser = {
            ...req.body,
            userId: id,
        }

        const validation = registerServerSchema.safeParse(newUser);
        if(!validation.success){
            const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
            apiResponse = { success: false, errors: fieldErrors, message: "" };
            return res.status(BAD_REQUEST_STATUS_CODE)
                    .json(apiResponse);
        }
        
        const existingUser = await User.findOne({ email });
        if(existingUser){
            throw new ApiError("User already exist", BAD_REQUEST_STATUS_CODE);
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ ...newUser, password: hashedPassword });
        await user.save();

        const accessToken = jwt.sign({ email: user.email, name: user.name, userId: user.userId }, process.env.JWT_SECRET as string, { expiresIn: JWT_ACCESS_EXPIRES_IN });
        const refreshToken = jwt.sign({ email: user.email, name: user.name, userId: user.userId }, process.env.JWT_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        res.cookie("refreshToken", refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            path: "/auth/refresh",
            maxAge: daysToMS(COOKIES_EXPIRES_IN_DAYS)
        });
        
        apiResponse = { success: true, message: "User registered successfully", data: { accessToken, name: user.name, email: user.email, userId: user.userId }};
        return res.status(CREATED_STATUS_CODE).json(apiResponse);
    }catch(exception){
        next(exception);
    }
});

app.post("/api/auth/login", isAuthenticated as any, async (req: AuthRequest, res: any, next: NextFunction) => {
    try{
        const { email, password } = req.body;
        let apiResponse: APIResponse;

        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
            apiResponse = { success: false, errors: fieldErrors, message: "" };
            return res.status(BAD_REQUEST_STATUS_CODE).json(apiResponse);
        }

        const user = await User.findOne({ email });
        if(!user){
            throw new ApiError("User does not exist", BAD_REQUEST_STATUS_CODE);
        }

        if(!(await bcrypt.compare(password, user.password))){
            throw new ApiError("Password is incorrect", BAD_REQUEST_STATUS_CODE);
        }

        const accessToken = jwt.sign({ email: user.email, name: user.name, userId: user.userId }, process.env.JWT_SECRET as string, { expiresIn: JWT_ACCESS_EXPIRES_IN });
        const refreshToken = jwt.sign({ email: user.email, name: user.name, userId: user.userId }, process.env.JWT_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        res.cookie("refreshToken", refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            path: "/auth/refresh", 
            maxAge: daysToMS(COOKIES_EXPIRES_IN_DAYS)
        });

        apiResponse = { success: true, data: { accessToken, name: user.name, email: user.email, userId: user.userId }, message: "User logged in successfully" };
        return res.status(OK_STATUS_CODE).json(apiResponse);
    }catch(exception){
        next(exception);
    }
});


app.get("/api/auth/is-logged-in", async (req: AuthRequest, res: any, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1]; 

    let apiResponse: APIResponse;
    if(!accessToken){
        apiResponse = { success: false, message: "Access token missing" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }

    try{
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        apiResponse = { success: true, data: { accessToken, name: decoded.name, email: decoded.email, userId: decoded.userId }, message: "Already logged in"};
        return res.status(OK_STATUS_CODE).json(apiResponse);
    }catch(error){
        apiResponse = { success: false, message: "Invalid access token" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }
});

app.get("/api/auth/refresh", async (req: AuthRequest, res: any, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken; 
    let apiResponse : APIResponse;
    if(!refreshToken){
        apiResponse = { success: false, message: "Please log in again" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        const newAccessToken = jwt.sign({ name: decoded.name, email: decoded.email, userId: decoded.userId }, process.env.JWT_SECRET as string, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        });

        apiResponse = { success: true, data: { accessToken: newAccessToken, name: decoded.name, email: decoded.email, userId: decoded.userId}, message: "" };
        return res.json(apiResponse);
    }catch(error){
        apiResponse = { success: false, message: "Please log in again" };
        return res.json(apiResponse);
    }
});

app.get("/api/auth/logout", async (req: AuthRequest, res: any, next: NextFunction) => {
    let apiResponse: APIResponse;
    try{
        res.clearCookie('refreshToken', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            path: "/auth/refresh", 
        });
        
        apiResponse = {success: true, message: "Logout successfully"};
        res.status(OK_STATUS_CODE).json(apiResponse);
    }catch(exception){
        next(exception)
    }
});

app.get("/api/auth/user", async (req: AuthRequest, res: any, next: NextFunction) => {
  let apiResponse: APIResponse;
  const email = req.query.email as string;
  try{
    if(!email){
      throw new ApiError("Email is required", BAD_REQUEST_STATUS_CODE);
    }

    const user = await User.findOne({ email }).select("name userId email");
    if(!user){
      throw new ApiError("User does not exist", BAD_REQUEST_STATUS_CODE);
    }

    apiResponse = { success: true, data: user, message: "User fetched successfully" };
    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
});

app.use((err: any, req: Request, res: any, next: NextFunction) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });

    const statusCode = err.statusCode || 500;
    let apiResponse: APIResponse = {
        success: false,
        message: err.message,
    }
    
    res.status(statusCode).json(apiResponse);
});