import { z } from "zod";
import {
  LANGUAGES,
  PROJECT_MAX_NAME_LEN,
  PROJECT_MIN_NAME_LEN,
  STROKE_COLORS,
  STROKE_WIDTHS,
  PROJECT_COLLABORATOR_TYPES,
  PROJECT_COLLABORATOR_ADD_TYPES,
} from "../../../packages/constants/index.ts";

const languageEnum = z.enum(LANGUAGES);
const strokeColorEnum = z.enum(STROKE_COLORS);

const strokeWidthEnum = z
  .union(
    STROKE_WIDTHS.map((w) => z.literal(w)) as [
      z.ZodLiteral<2>,
      z.ZodLiteral<4>,
      z.ZodLiteral<6>
    ]
  )
  .refine((val) => STROKE_WIDTHS.includes(val));

const projectCollaboratorTypeEnum = z.enum(PROJECT_COLLABORATOR_TYPES);
const projectCollaboratorAddTypeEnum = z.enum(PROJECT_COLLABORATOR_ADD_TYPES);

export const codeTabSchema = z.object({
  codeTabId: z.string().trim().min(1, { message: "Code tab must have an ID" }),
  language: languageEnum,
  code: z.string().trim(),
});

export const shapeSchema = z.object({
  points: z
    .array(z.tuple([z.number(), z.number()]))
    .min(1, "Each shape must have at least one point."),
  options: z.object({
    stroke: strokeColorEnum,
    roughness: z.number(),
    strokeWidth: strokeWidthEnum,
  }),
});

export const whiteboardTabSchema = z.object({
  whiteboardTabId: z.string().uuid(),
  shapes: z.array(shapeSchema),
});

export const projectCreateClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(PROJECT_MIN_NAME_LEN, {
      message: `Project name must be at least ${PROJECT_MIN_NAME_LEN} characters`,
    })
    .max(PROJECT_MAX_NAME_LEN, {
      message: `Project name must not exceed ${PROJECT_MAX_NAME_LEN} characters`,
    }),
});

export const projectCreateServerSchema = projectCreateClientSchema.extend({
  projectId: z
    .string()
    .trim()
    .min(1, { message: "projectId cannot be empty" }),
  owner: z.object({
    userId: z
      .string()
      .trim()
      .min(1, { message: "User id in the owner cannot be empty" }),
    email: z
      .string()
      .trim()
      .email({ message: "Not a valid email" })
      .min(1, { message: "Email cannot be empty" }),
    name: z.string().trim().min(1, { message: "Name cannot be empty" }),
    type: projectCollaboratorTypeEnum,
  }),
  codeTabs: z
    .array(codeTabSchema)
    .min(1, { message: "At least one code tab is required" }),
  whiteboardTabs: z
    .array(whiteboardTabSchema)
    .min(1, { message: "At least one whiteboard tab is required" }),
});

export const projectUpdateSchema = projectCreateClientSchema;

export const projectCollaboratorAddClientSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Not a valid email" })
    .min(1, { message: "Email cannot be empty" }),
  type: projectCollaboratorAddTypeEnum,
});

export const projectCollaboratorAddServerSchema =
  projectCollaboratorAddClientSchema.extend({
    userId: z
      .string()
      .trim()
      .min(1, { message: "userId cannot be empty" }),
    name: z.string().trim().min(1, { message: "Name cannot be empty" }),
  });

export const projectCollaboratorUpdateSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, { message: "userId cannot be empty" }),
  type: projectCollaboratorAddTypeEnum,
});