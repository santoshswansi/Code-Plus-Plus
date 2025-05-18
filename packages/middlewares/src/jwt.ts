import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UNAUTHORIZED_STATUS_CODE, OK_STATUS_CODE } from "../../../packages/constants/index.ts";
import { APIResponse, AuthenticatedRequest, JwtPayload } from "../../../packages/types/index.ts";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1]; 

    if(!accessToken){
        return next();
    }

    let apiResponse: APIResponse;
    try{
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;
        apiResponse = { success: true, data: { accessToken, name: decoded.name, email: decoded.email, userId: decoded.userId }, message: "Already logged in"};
        return res.status(OK_STATUS_CODE).json(apiResponse);
    }catch(error){
        apiResponse = { success: false, message: "Invalid access token" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }
};

export const isProtected  = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization?.split(" ")[1]; 

    let apiResponse: APIResponse;
    if(!accessToken){
        apiResponse = { success: false, message: "Unauthorized" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }

    try{
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    }catch(error){
        apiResponse = { success: false, message: "Invalid access token" };
        return res.status(UNAUTHORIZED_STATUS_CODE).json(apiResponse);
    }
};