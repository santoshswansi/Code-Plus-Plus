import mongoose from "mongoose";

const UserRefSchema = new mongoose.Schema({
  userId: { type: String, required: true },    
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: {type: String, required: true},
}, { _id: false });

const CodeTabSchema = new mongoose.Schema({
  codeTabId: { type: String, required: true, unique: true },
  language: { type: String, required: true },
  code: { type: String, default: "" }
}, { _id: false });

const WhiteboardTabSchema = new mongoose.Schema({
  whiteboardTabId: { type: String, required: true, unique: true },
  paths: [{
    points: [[Number]],
    strokeColor: String,
    strokeWidth: Number
  }],
  dots: [{
    cx: Number,
    cy: Number,
    strokeColor: String,
    strokeWidth: Number
  }],
  currPath: [[Number]]
}, { _id: false });

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


export const Project = mongoose.model("Project", ProjectSchema);
