import { Response, NextFunction } from "express";
import { Project } from "../models/project.ts";
import { ApiError } from "../../../packages/helpers/index.ts";
import { FORBIDDEN_STATUS_CODE, NOT_FOUND_STATUS_CODE, OWNER, BAD_REQUEST_STATUS_CODE, OK_STATUS_CODE, CREATED_STATUS_CODE, EDITOR, MAX_ITEMS_LIMIT, DEFAULT_LANGUAGE, DEFAULT_CODE, MAX_TABS_ALLOWED } from "../../../packages/constants/index.ts";
import {v4 as uuidv4} from "uuid";
import { codeTabSchema, projectCollaboratorAddServerSchema, projectCollaboratorUpdateSchema, projectCreateServerSchema, projectUpdateSchema, whiteboardTabSchema } from "../../../packages/validators/index.ts";
import { APIResponse, APIResponseUser, AuthenticatedRequest, JwtPayload } from "../../../packages/types/index.ts";
import ky from "ky";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { name } = req.body;
    const owner = req.user as JwtPayload

    const codeTabs = [{codeTabId: uuidv4(), language: DEFAULT_LANGUAGE, code: DEFAULT_CODE[DEFAULT_LANGUAGE]}]; 
    const whiteboardTabs = [{whiteboardTabId: uuidv4(), shapes: []}];
    const id = uuidv4();
    const newProject = {
      projectId: id,
      name,
      owner: {userId: owner.userId, name: owner.name, email: owner.email, type: OWNER},
      codeTabs,
      whiteboardTabs,
    };

    let apiResponse: APIResponse;
    const validation = projectCreateServerSchema.safeParse(newProject);
    if(!validation.success){
        const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
        apiResponse = { success: false, errors: fieldErrors, message: "" };
        return res.status(BAD_REQUEST_STATUS_CODE)
                .json(apiResponse);
    }

    const project = await Project.create(newProject);
    apiResponse = { success: true, data: project, message: "Project created successfully" };
    res.status(CREATED_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   try{
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, MAX_ITEMS_LIMIT);

    const projects = await Project.find({
      $or: [
        { "owner.userId": userId },
        { collaborators: { $elemMatch: { userId } } }
      ]
    })
      .sort({ createdOn: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("projectId name createdOn owner.userId");

    const apiResponse: APIResponse = {
      success: true,
      data: projects,
      message: "Projects fetched successfully"
    };

    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const userId = req.user?.userId;
    const project = await Project.findOne({
      "projectId": req.params.projectId
    });

    if(!project) 
        throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    if(project.owner.userId !== userId && (project.owner.userId === userId || !project.collaborators.some(user => user.userId === userId)))
        throw new ApiError("You are not allowed to view the project", FORBIDDEN_STATUS_CODE);

    let apiResponse: APIResponse;
    apiResponse = {success: true, data: project, message: "Project fetched successfully"};
    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const userId = req.user?.userId;
    const projectId = req.params.projectId;

    const {name} = req.body;

    let apiResponse: APIResponse;
    const validation = projectUpdateSchema.safeParse({name});
    if(!validation.success){
        const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
        apiResponse = { success: false, errors: fieldErrors, message: "" };
        return res.status(BAD_REQUEST_STATUS_CODE)
                .json(apiResponse);
    }

    const project = await Project.findOne({
      "projectId": projectId
    });

    if(!project) 
        throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    if(userId !== project.owner.userId && (userId !== project.owner.userId || !project.collaborators.some(user => user.userId === userId && user.type === EDITOR)))
        throw new ApiError("You are not allowed to update the project", FORBIDDEN_STATUS_CODE);

    project.name = name;
    await project.save();

    apiResponse = {success: true, data: {projectId, name: project.name}, message: "Project updated successfully"};
    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const projectId = req.params.projectId;
    const userId = req.user?.userId;

    const project = await Project.findOne({
      "projectId": projectId
    });
    
    if(!project) 
        throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    if(project.owner.userId !== userId){
      throw new ApiError("Only the owner can delete the project.", FORBIDDEN_STATUS_CODE);
    }

    await project.deleteOne();

    const apiResponse: APIResponse = {
      success: true,
      message: "Project deleted successfully",
      data: {
        projectId
      }
    };

    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const addCodeTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const newTab = {
      codeTabId: uuidv4(),
      language: DEFAULT_LANGUAGE,
      code: DEFAULT_CODE[DEFAULT_LANGUAGE],
    };

    let apiResponse: APIResponse;
    const validation = codeTabSchema.safeParse({...newTab});
    if(!validation.success){
        const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
        apiResponse = { success: false, errors: fieldErrors, message: "" };
        return res.status(BAD_REQUEST_STATUS_CODE)
                .json(apiResponse);
    }

    const project = await Project.findOne({ projectId });
    if(!project) 
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some(collab => collab.userId === userId && collab.type === EDITOR);
    if(!isOwner && !isEditor) 
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);

    if(project.codeTabs.length >= MAX_TABS_ALLOWED){
      throw new ApiError(`Cannot add more than ${MAX_TABS_ALLOWED} code tabs`, BAD_REQUEST_STATUS_CODE);
    }

    project.codeTabs.push(newTab);
    await project.save();

    apiResponse = { success: true, message: "Code tab added successfully", data: {projectId, codeTab: newTab} };
    res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const addWhiteboardTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    const newTab = {
      whiteboardTabId: uuidv4(),
      shapes: [],
    };

    let apiResponse: APIResponse;
    const validation = whiteboardTabSchema.safeParse({...newTab});
    if(!validation.success){
        const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
        apiResponse = { success: false, errors: fieldErrors, message: "" };
        return res.status(BAD_REQUEST_STATUS_CODE)
                .json(apiResponse);
    }

    const project = await Project.findOne({ projectId: projectId });
    if(!project) 
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some(collab => collab.userId === userId && collab.type === EDITOR);
    if(!isOwner && !isEditor) 
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);

    if(project.codeTabs.length >= MAX_TABS_ALLOWED){
      throw new ApiError(`Cannot add more than ${MAX_TABS_ALLOWED} code tabs`, BAD_REQUEST_STATUS_CODE);
    }

    project.whiteboardTabs.push(newTab);
    await project.save();

    apiResponse = { success: true, message: "Whiteboard tab added successfully", data: {projectId, whiteboardTab: newTab} };
    res.json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const updateCodeTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId, codeTabId } = req.params;
    const { language, code } = req.body;
    const userId = req.user?.userId;

    const currTab = {
      codeTabId: codeTabId,
      language,
      code,
    };

    let apiResponse: APIResponse;
    const validation = codeTabSchema.safeParse({...currTab});
    if(!validation.success){
        const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
        apiResponse = { success: false, errors: fieldErrors, message: "" };
        return res.status(BAD_REQUEST_STATUS_CODE)
                .json(apiResponse);
    }

    const project = await Project.findOne({ projectId: projectId });
    if(!project) 
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some(collab => collab.userId === userId && collab.type === EDITOR);
    if(!isOwner && !isEditor) 
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);

    const tab = project.codeTabs.find(tab => tab.codeTabId === codeTabId);
    if(!tab) 
      throw new ApiError("Code tab not found", NOT_FOUND_STATUS_CODE);

    tab.code = code;
    tab.language = language;
    await project.save();

    apiResponse = { success: true, message: "Code tab updated successfully", data: tab };
    res.json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const updateWhiteboardTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId, whiteboardTabId } = req.params;
    const { shapes } = req.body;
    const userId = req.user?.userId;

    const currTabPayload = {
      whiteboardTabId,
      shapes,
    };

    let apiResponse: APIResponse;
    const validation = whiteboardTabSchema.safeParse({ ...currTabPayload });
    console.log(validation.success);
    if(!validation.success){
      const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
      apiResponse = { success: false, errors: fieldErrors, message: "" };
      return res.status(BAD_REQUEST_STATUS_CODE).json(apiResponse);
    }

    const project = await Project.findOne({ projectId });
    if(!project){
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    }

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some((collab) => collab.userId === userId && collab.type === EDITOR);
    if(!isOwner && !isEditor){
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);
    }

    const tab = project.whiteboardTabs.find((tab) => tab.whiteboardTabId === whiteboardTabId);
    if(!tab){
      throw new ApiError("Whiteboard tab not found", NOT_FOUND_STATUS_CODE);
    }

    tab.shapes = shapes;
    await project.save();

    apiResponse = {
      success: true,
      message: "Whiteboard tab updated successfully",
      data: tab,
    };
    return res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const deleteCodeTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId, codeTabId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findOne({ projectId: projectId });
    if(!project) 
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some(
      (collab) => collab.userId === userId && collab.type === EDITOR
    );

    if(!isOwner && !isEditor){
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);
    }

    if(project.codeTabs.length === 1){
      throw new ApiError("At least one code tab must remain", BAD_REQUEST_STATUS_CODE);
    }

    project.codeTabs.pull({codeTabId});
    await project.save();

    let apiResponse: APIResponse = { success: true, data: {projectId, codeTabId}, message: "Code tab deleted successfully" };
    res.json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const deleteWhiteboardTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, whiteboardTabId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findOne({ projectId: projectId });
    if(!project) 
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    const isOwner = project.owner.userId === userId;
    const isEditor = project.collaborators.some(
      (collab) => collab.userId === userId && collab.type === EDITOR
    );

    if(!isOwner && !isEditor){
      throw new ApiError("You do not have edit right", FORBIDDEN_STATUS_CODE);
    }

    if(project.whiteboardTabs.length === 1){
      throw new ApiError("At least one whiteboard tab must remain", BAD_REQUEST_STATUS_CODE);
    }

    project.whiteboardTabs.pull({whiteboardTabId});
    await project.save();

    let apiResponse: APIResponse = { success: true, data: {projectId, whiteboardTabId} ,message: "Whiteboard tab deleted successfully" };
    res.json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const addCollaborator = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
 try{
    const projectId = req.params.projectId;
    const requestorId = req.user?.userId;

    const project = await Project.findOne({
      "projectId": projectId
    });
    
    if(!project){
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    }

    if(project.owner.userId !== requestorId){
      throw new ApiError("Only the owner can add collaborators", FORBIDDEN_STATUS_CODE);
    }

    try{
      const response: APIResponseUser = await ky.get(`${process.env.API_GATEWAY_BASE_URL}/auth/user`, {
        searchParams: { email: req.body.email }
      }).json();

      if(!response.success){
        throw new ApiError(response.message, BAD_REQUEST_STATUS_CODE);
      }

      if(project.owner.userId === response.data.userId){
        throw new ApiError("Owner cannot be added as a collaborator", BAD_REQUEST_STATUS_CODE);
      }

      const alreadyAdded = project.collaborators.some(user => user.userId === response.data.userId);
      if(alreadyAdded){
        throw new ApiError("User is already a collaborator", BAD_REQUEST_STATUS_CODE);
      }

      const collaborator = {
        name: response.data.name,
        userId: response.data.userId,
        email: response.data.email,
        type: req.body.type,
      };

      const validation = projectCollaboratorAddServerSchema.safeParse(collaborator);
   
      let apiResponse: APIResponse;
      if(!validation.success){
          const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
          apiResponse = { success: false, errors: fieldErrors, message: "" };
          return res.status(BAD_REQUEST_STATUS_CODE)
                  .json(apiResponse);
      }

      project.collaborators.push(collaborator);
      await project.save();

      apiResponse = {success: true, data: {projectId, collaborator}, message: "Collaborator added successfully"};
      res.json(apiResponse);
    }catch(exception){
      next(exception);
    }
  }catch(exception){
    next(exception);
  }
};

export const updateCollaborator = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    const requestorId = req.user?.userId;
    const collaboratorId = req.params.userId;

    const collaboratorUpdateData = { userId: collaboratorId, ...req.body };

    const validation = projectCollaboratorUpdateSchema.safeParse(collaboratorUpdateData);

    let apiResponse: APIResponse;
    if(!validation.success){
      const fieldErrors = Object.values(validation.error.flatten().fieldErrors).flat();
      apiResponse = { success: false, errors: fieldErrors, message: "" };
      return res.status(BAD_REQUEST_STATUS_CODE).json(apiResponse);
    }

    const project = await Project.findOne({ projectId });
    if(!project){
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    }

    if(project.owner.userId !== requestorId){
      throw new ApiError("Only the owner can update collaborators", FORBIDDEN_STATUS_CODE);
    }

    if(project.owner.userId === collaboratorId){
      throw new ApiError("Owner cannot update himself", BAD_REQUEST_STATUS_CODE);
    }

    const currCollaborator = project.collaborators.find(user => user.userId === collaboratorId);
    if(!currCollaborator){
      throw new ApiError("Collaborator not present", BAD_REQUEST_STATUS_CODE);
    }

    if(currCollaborator.type === req.body.type){
      throw new ApiError("Collaborator already has the same type", BAD_REQUEST_STATUS_CODE);
    }

    currCollaborator.type = req.body.type;
    await project.save();

    apiResponse = { success: true, data: { projectId, collaborator: { userId: collaboratorId, type: req.body.type } }, message: "Collaborator updated successfully" };
    res.json(apiResponse);

  }catch(exception){
    next(exception);
  }
};

export const removeCollaborator = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const projectId = req.params.projectId;
    const collaboratorId = req.params.userId;
    const requestorId = req.user?.userId;
    
    const project = await Project.findOne({
      "projectId": projectId
    });
    
    if(!project) throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);

    if(project.owner.userId !== requestorId){
      throw new ApiError("Only the owner can remove collaborators", FORBIDDEN_STATUS_CODE);
    }

    if(project.owner.userId === collaboratorId){
      throw new ApiError("Owner cannot be removed as a collaborator", BAD_REQUEST_STATUS_CODE);
    }

    const alreadyAdded = project.collaborators.some(user => user.userId === collaboratorId);
    if(!alreadyAdded){
      throw new ApiError("User is not a collaborator", BAD_REQUEST_STATUS_CODE);
    }

    const updated = await Project.findOneAndUpdate(
      { projectId: req.params.projectId },
      { $pull: { collaborators: {userId: collaboratorId} } },
      { new: true }
    );

    if(!updated) throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    const apiResponse: APIResponse = {success: true, data: {projectId, collaboratorId}, message: "Collaborator removed successfully"};
    res.json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const getUserPermission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId, userId } = req.params;
    const project = await Project.findOne({ projectId });
    if(!project){
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    }

    const isOwner = project.owner.userId === userId;
    const user = project.collaborators.filter(collab => collab.userId === userId);
    const apiResponse: APIResponse = {
      success: true,
      data: { type: (isOwner ? OWNER :  user[0].type)},
      message: ""
    };
    
    return res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};

export const getWhiteboardTab = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const { projectId, whiteboardTabId } = req.params;
    const userId = req.user?.userId;

    const project = await Project.findOne({ projectId });
    if(!project){
      throw new ApiError("Project not found", NOT_FOUND_STATUS_CODE);
    }

    const isOwner = project.owner.userId === userId;
    const isCollaborator = project.collaborators.some((collab) => collab.userId === userId);
    if(!isOwner && !isCollaborator){
      throw new ApiError("You do not have access to this project", FORBIDDEN_STATUS_CODE);
    }

    const tab = project.whiteboardTabs.find((tab) => tab.whiteboardTabId === whiteboardTabId);
    if(!tab){
      throw new ApiError("Whiteboard tab not found", NOT_FOUND_STATUS_CODE);
    }

    const apiResponse: APIResponse = {
      success: true,
      data: tab,
      message: "Whiteboard tab fetched successfully",
    };
    return res.status(OK_STATUS_CODE).json(apiResponse);
  }catch(exception){
    next(exception);
  }
};
