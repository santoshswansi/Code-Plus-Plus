import api from "@/lib/api";
import useGlobalStore from "@/store/useGlobalStore";
import { toast } from "sonner";
import { projectCollaboratorAddClientSchema, projectCollaboratorUpdateSchema, projectCreateClientSchema, projectUpdateSchema } from "../../../packages/validators/src/projectSchema";
import { toastValidationErrors } from "@/helpers/toastValidationErrors";
import { UNSAVED } from "@/constants";

const store = useGlobalStore;
export const handleCreateProject = async (name) => {
  try{
    const validation = projectCreateClientSchema.safeParse({name});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.post('projects', {
      json: { name },
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().addNewProject(res.data); 
      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    console.log(errBody);
    const message = errBody.message || "Project creation failed due to a network or server error";
    toast.error(message);
    return false;
  }
};

export const handleGetProjects = async (pageNo, limit) => {
  try{
    const res = await api.get(`projects?page=${pageNo}&limit=${limit}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      res.data.forEach(project => {
        store.getState().addNewProject(project);         
      });

      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    return false;
  }
};

export const handleGetProject = async (projectId) => {
  try{
    const res = await api.get(`projects/${projectId}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().setCurrProject({...res.data, currCodeTabIdx: 0, currWhiteboardTabIdx: 0}); 
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    return false;
  }
};

export const handleUpdateProject = async (projectId, name) => {
  try{
    const validation = projectUpdateSchema.safeParse({name});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.put(`projects/${projectId}`, {
      json: {name},
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().updateProject(projectId, {name});
      if(projectId === store.getState().currProject.projectId){
        store.getState().updateCurrProject({name}); 
      }
      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to update project";
    toast.error(message);
    return false;
  }
};

export const handleDeleteProject = async (projectId) => {
  try{
    const res = await api.delete(`projects/${projectId}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().deleteProject(projectId);
      if(projectId === store.getState().currProject.projectId){
        store.getState().setCurrProject(set.getState().playgroundProject); 
      }
      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to delete project";
    toast.error(message);
    return false;
  }
};

export const handleAddCodeTabToProject = async (projectId) => {
  try{
    const res = await api.post(`projects/${projectId}/code-tabs`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().addCodeTab(res.data.codeTab);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to add code tab to project";
    toast.error(message);
    return false;
  }
};

export const handleAddWhiteboardTabToProject = async (projectId) => {
  try{
    const res = await api.post(`projects/${projectId}/whiteboard-tabs`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().addWhiteboardTab(res.data.whiteboardTab);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to add whiteboard tab to project";
    toast.error(message);
    return false;
  }
};


export const handleUpdateCodeTabToProject = async (projectId, codeTabId, language, code) => {
  try{
    const res = await api.put(`projects/${projectId}/code-tabs/${codeTabId}`, {
      json: {language, code},
      credentials: 'include',
    }).json();

    if(res.success){
      if(store.getState().saveStatus !== UNSAVED){
        store.getState().updateCodeTab(codeTabId, {language, code});
      }
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to update code tab in project";
    toast.error(message);
    return false;
  }
};

export const handleUpdateWhiteboardTabToProject = async (projectId, whiteboardTabId, updates) => {
  try{
    const res = await api.put(`projects/${projectId}/whiteboard-tabs/${whiteboardTabId}`, {
      json: updates, 
      credentials: 'include',
    }).json();

    if(res.success){
      if(store.getState().saveStatus !== UNSAVED){
        store.getState().updateWhiteboardTab(whiteboardTabId, updates);
      }
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to update whiteboard tab in project";
    toast.error(message);
    return false;
  }
};

export const handleDeleteCodeTabOfProject = async (projectId, codeTabId) => {
  try{
    const res = await api.delete(`projects/${projectId}/code-tabs/${codeTabId}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().deleteCodeTab(codeTabId);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to delete code tab in project";
    toast.error(message);
    return false;
  }
};

export const handleDeleteWhiteboardTabOfProject = async (projectId, whiteboardTabId) => {
  try{
    const res = await api.delete(`projects/${projectId}/whiteboard-tabs/${whiteboardTabId}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().deleteWhiteboardTab(whiteboardTabId);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to delete whiteboard tab in project";
    toast.error(message);
    return false;
  }
};

export const handleAddCollaboratorOfProject = async (projectId, email, type) => {
  try{
    const validation = projectCollaboratorAddClientSchema.safeParse({email, type});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.post(`projects/${projectId}/collaborators`, {
      json: {email, type},
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().addCollaborator(res.data.collaborator);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to add collaborator";
    toast.error(message);
    return false;
  }
};

export const handleUpdateCollaboratorOfProject = async (projectId, userId, type) => {
  try{
    const validation = projectCollaboratorUpdateSchema.safeParse({userId, type});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.put(`projects/${projectId}/collaborators/${userId}`, {
      json: {type},
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().updateCollaborator(userId, {type});
      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
        
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to update collaborator";
    toast.error(message);
    return false;
  }
};

export const handleDeleteCollaboratorOfProject = async (projectId, userId) => {
  try{
    const res = await api.delete(`projects/${projectId}/collaborators/${userId}`, {
      credentials: 'include',
    }).json();

    if(res.success){
      store.getState().deleteCollaborator(userId);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    
    const errBody = await err.response.json();
    const message = errBody.message || "Failed to delete collaborator";
    toast.error(message);
    return false;
  }
};