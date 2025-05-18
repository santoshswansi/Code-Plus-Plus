"use client"
import React, { useState } from 'react'
import {SquarePen, Trash2, FolderOpen} from "lucide-react"
import { Dialog } from 'primereact/dialog'
import useGlobalStore from '@/store/useGlobalStore';
import useAuthStore from '@/store/useAuthStore';
import { CREATE_MODE, PLAYGROUND_PROJECT_ID, UPDATE_MODE, PROJECT_SKELETIONS_SIZE } from '@/constants';
import { handleCreateProject, handleDeleteProject, handleGetProject, handleUpdateProject } from '@/api/project';
import {getDate} from "../../../packages/helpers";
import ProjectSkeleton from './skeleton/ProjectSkeleton';
import { OWNER } from "../../../packages/constants";
import { currUserHasEditAccessRightToCurrProjectHelper } from '@/helpers/hasEditAccessRight';

function Projects() {
    const [projectDialogVisible, setProjectDialogVisible] = useState(false);
    const {projects, currProject, setCurrProject, playgroundProject, isProjectsFetching, setCurrUserHasEditAccessRightToCurrProject} = useGlobalStore();
    const {userId} = useAuthStore();
    const [projectInput, setProjectInput] = useState({name: ""});
    const [updateOrCreateMode, setUpdateOrCreateMode] = useState(UPDATE_MODE)

    const removeProject = (projectId) => {
       handleDeleteProject(projectId);
    }

    const updateProject = () => {
        if(handleUpdateProject(projectInput.projectId, projectInput.name)){
            setProjectDialogVisible(false);
            projectInput.projectId = "";
            projectInput.name = "";
        }
    }

    const createProject = () => {
        if(handleCreateProject(projectInput.name))
            setProjectDialogVisible(false);
    }

    const openProject = async (selectedProjectId) => {
        if(selectedProjectId !== currProject?.projectId){
            if(selectedProjectId === PLAYGROUND_PROJECT_ID){
                await setCurrProject(playgroundProject);
            }else{
                await handleGetProject(selectedProjectId);
            }
            setCurrUserHasEditAccessRightToCurrProject(currUserHasEditAccessRightToCurrProjectHelper());
        }
    }

    return (
        <div className="flex flex-col w-full h-[100vh] !p-6 gap-6 bg-white">
            <div className="flex items-center justify-between">
                <p className="text-lg">Projects</p>
                <div className={`h-7 w-45 rounded-sm text-white flex items-center justify-center ${userId !== "" ? "bg-indigo-600 hover:bg-indigo-500 cursor-pointer" : "bg-indigo-300"}`} onClick={() => { setUpdateOrCreateMode(CREATE_MODE); setProjectInput({name: ""});  setProjectDialogVisible(true); }}>+ Create New Project</div>
            </div>
            <div className="grid grid-cols-3 w-[100%] gap-8">
                <div key={playgroundProject.projectId} className="flex items-center justify-between h-25 w-90 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-sm !px-4 !py-2">
                    <div>
                        <p className="text-lg">{playgroundProject.name}</p>
                        <p className="text-sm text-slate-500">{playgroundProject.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        <FolderOpen className={`h-5 w-5 ${ PLAYGROUND_PROJECT_ID !== currProject?.projectId ? "cursor-pointer" : "text-slate-300"}`} onClick={() => openProject(PLAYGROUND_PROJECT_ID) } />
                        <SquarePen className="h-5 w-5 text-slate-300" />
                        <Trash2  className="h-5 w-5 text-slate-300" />
                    </div>
                </div>
                {
                    isProjectsFetching ? 
                        <>
                            {
                                Array.from({ length: PROJECT_SKELETIONS_SIZE }).map((_, i) => (
                                    <ProjectSkeleton key={i} />
                                ))
                            }
                        </>
                    :
                    projects.map((project, index) => {
                        return (
                            <div key={index} className="flex items-center justify-between h-25 w-90 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-sm !px-4 !py-2">
                                <div>
                                    <p className="text-lg">{project.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-slate-500">{getDate(project.createdOn)}</p>
            
                                        {
                                            project.owner.userId === userId ? <p className='text-xs bg-black text-white !px-2 rounded-lg flex items-center justify-center'>{OWNER}</p> : <></>
                                        }
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <FolderOpen className={`h-5 w-5 ${ project.projectId !== currProject?.projectId ? "cursor-pointer" : "text-slate-300"}`} onClick={() => openProject(project.projectId) } />
                                    <SquarePen className={`h-5 w-5 ${ project.owner.userId === userId ? "cursor-pointer" : "text-slate-300"}`} onClick={() => {
                                        if(project.owner.userId === userId){
                                            projectInput.projectId = project.projectId;
                                            projectInput.name = project.name;
                                            setUpdateOrCreateMode(UPDATE_MODE);
                                            setProjectDialogVisible(true);
                                        }
                                    }} />
                                    <Trash2  
                                        className={`h-5 w-5 ${ project.owner.userId === userId ? "cursor-pointer" : "text-slate-300"}`}
                                        onClick={() => 
                                            project.owner.userId === userId ?
                                            removeProject(project.projectId) : ""
                                        } 
                                    />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <Dialog header={"Create New Project"} visible={projectDialogVisible} className='bg-white w-90 h-45 shadow-md rounded-2xl !px-6 !py-4' onHide={() => {if (!projectDialogVisible) return; setProjectDialogVisible(false); }}>
                <div className='flex flex-col gap-4 !mt-2'>
                    <div className="flex flex-col gap-1">
                        <label htmlFor='project' className="text-slate-500">Project Name</label>
                        <input type="text" id="project" value={projectInput?.name} placeholder="Enter project name" className="bg-slate-200 rounded-sm !p-1 focus:outline-none" 
                              onChange={(e) => setProjectInput((proj) => ({...proj, name: e.target.value}))} />
                    </div>
                    <input type="button" value={updateOrCreateMode == CREATE_MODE ? "Create Project" : "Update Project"} className="flex h-7 w-30 bg-indigo-600 items-center justify-center rounded-sm text-white hover:bg-indigo-500 cursor-pointer" 
                        onClick={() => ((updateOrCreateMode === UPDATE_MODE) ? updateProject(): createProject())} 
                    />
                </div>
            </Dialog>
        </div>
    )
}

export default Projects