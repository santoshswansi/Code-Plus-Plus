import { z } from "zod";
import { MAX_NAME_LEN, MIN_NAME_LEN } from "../../../packages/constants/index.ts";

export const registerClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LEN, { message: `Name must be at least ${MIN_NAME_LEN} characters` })
    .max(MAX_NAME_LEN, { message: `Name must not exceed ${MAX_NAME_LEN} characters` }),
  
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" }),
  
  password: z
    .string()
    .trim()
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
});

export const registerServerSchema = registerClientSchema.extend({
  userId: z
    .string()
    .trim()
    .min(1, { message: "UserId cannot be empty" })
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .trim()
    .min(1, "Password cannot be empty")
});