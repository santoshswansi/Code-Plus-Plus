import mongoose, { Document, Schema } from "mongoose";

const UserRefSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const CodeTabSchema = new mongoose.Schema(
  {
    codeTabId: { type: String, required: true, unique: true },
    language: { type: String, required: true },
    code: { type: String, default: "" },
  },
  { _id: false }
);

const ShapeSchema = new mongoose.Schema(
  {
    points: {
      type: [[Number]],
      required: true,
      validate: {
        validator: (arr: number[][]) => arr.every((pt) => pt.length === 2),
        message: "Each point must be an array of two numbers [x, y].",
      },
    },
    options: {
      stroke: { type: String, required: true },
      roughness: { type: Number, required: true },
      strokeWidth: { type: Number, required: true },
    },
  },
  { _id: false }
);

const WhiteboardTabSchema = new mongoose.Schema(
  {
    whiteboardTabId: { type: String, required: true, unique: true },
    shapes: {
      type: [ShapeSchema],
      default: [],
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
  owner: { type: UserRefSchema, required: true },
  collaborators: {
    type: [UserRefSchema],
    default: [],
  },
  codeTabs: [CodeTabSchema],
  whiteboardTabs: [WhiteboardTabSchema],
});

export interface IShape {
  points: [number, number][];
  options: {
    stroke: string;
    roughness: number;
    strokeWidth: number;
  };
}

export interface IWhiteboardTab {
  whiteboardTabId: string;
  shapes: IShape[];
}

export interface IProject extends Document {
  projectId: string;
  name: string;
  createdOn: Date;
  owner: {
    userId: string;
    name: string;
    email: string;
    type: string;
  };
  collaborators: Array<{
    userId: string;
    name: string;
    email: string;
    type: string;
  }>;
  codeTabs: Array<{
    codeTabId: string;
    language: string;
    code: string;
  }>;
  whiteboardTabs: IWhiteboardTab[];
}

export const Project = mongoose.model<IProject>("Project", ProjectSchema);