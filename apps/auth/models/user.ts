import mongoose from "mongoose";
import { IUser } from "../types/types.ts";

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: {type: String, required: true},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

export const User = mongoose.model<IUser>("User", UserSchema);