import { Request } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
    userId: string;
    name: string;
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    body: {
        name?: string;
        email: string;
        password: string;
    };
}

export interface JWTPayload {
    name: string,
}