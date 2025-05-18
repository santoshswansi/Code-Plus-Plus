"use client"
import React, { useState } from 'react'
import { UserPlus, UserRoundPen, UserRoundX } from "lucide-react"
import { VIEWER } from "../../../packages/constants";
import Profile from './Profile';
import Invite from './Invite';
import { Dialog } from 'primereact/dialog';
import useGlobalStore from "@/store/useGlobalStore";
import { ADD_MODE, PLAYGROUND_PROJECT_ID, UPDATE_MODE } from '@/constants';
import { handleAddCollaboratorOfProject, handleDeleteCollaboratorOfProject, handleUpdateCollaboratorOfProject } from '@/api/project';
import useAuthStore from '@/store/useAuthStore';

function Collaborators() {
    const [inviteDialogVisible, setInviteDialogVisible] = useState(false);
    const {currProject} = useGlobalStore();  
    const {userId} = useAuthStore();
    const [addOrUpdateMode, setAddOrUpdateMode] = useState(ADD_MODE); 
    const [collaborator, setCollaborator] = useState({email: "", name: "", userId: "", type: VIEWER});

    const handleAddOrUpdateCollaborator = async () => {
        if(currProject.projectId === PLAYGROUND_PROJECT_ID)
            return;

        setInviteDialogVisible(true);
        if(addOrUpdateMode == ADD_MODE){
            const res = await handleAddCollaboratorOfProject(currProject.projectId, collaborator.email, collaborator.type);
            if(res){
                setInviteDialogVisible(false);
                setCollaborator({email: "", name: "", userId: "", type: VIEWER});
            }
        }else{
            const res = await handleUpdateCollaboratorOfProject(currProject.projectId, collaborator?.userId, collaborator?.type);
            if(res){
                setInviteDialogVisible(false);
                setCollaborator({email: "", name: "", userId: "", type: VIEWER});
            }
        }
    };

    const handleCollaboratorDelete = (userId) => {
        handleDeleteCollaboratorOfProject(currProject.projectId, userId);
    }

    return(
        <div className="flex flex-col items-center gap-6 w-[100%] h-[100vh] bg-white">
            <div className="flex items-center !px-6 justify-between w-[100%] !py-3">
                <p className="text-lg">Collaborators</p>
                <div className={`flex gap-1 items-center justify-center rounded-md text-white h-7 w-20 ${ currProject.projectId !== PLAYGROUND_PROJECT_ID && currProject?.owner?.userId === userId  ? "bg-indigo-600 cursor-pointer hover:bg-indigo-500" : ""}`} 
                    onClick={() => {
                        if(currProject.projectId !== PLAYGROUND_PROJECT_ID && currProject?.owner?.userId === userId){
                            setInviteDialogVisible(true);
                            setAddOrUpdateMode(ADD_MODE);
                            setCollaborator({email: "", userId: "", type: VIEWER});
                        }
                    }}
                >
                  <UserPlus className="h-4 w-4" /> Invite
                </div>
            </div>
            <div className="w-[100%]">
                <div className="flex flex-col items-start gap-4 !mx-6 !px-3 !py-3 rounded-sm shadow-[0px_0px_10px_rgba(0,0,0,0.13)]">
                    <p className="text-md">{`Active Now (${currProject.collaborators.length + (currProject.projectId !== PLAYGROUND_PROJECT_ID)})`}</p>
                    <div className="flex flex-col items-center justify-center gap-4 w-[100%]">
                        {
                            currProject.projectId !== PLAYGROUND_PROJECT_ID ?
                            <div className="flex w-[100%] items-center gap-8 !p-2 bg-slate-50"> 
                                <div className="flex items-center gap-2">
                                    <Profile name={currProject.owner.name} width={7} textSize={"md"}/>
                                    <div className="flex flex-col items-start justify-center">
                                        <p className="text-md">{currProject.owner.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className='text-sm text-slate-600'>{currProject.owner.email}</p>
                                            <p className='text-xs bg-black text-white !px-2 rounded-lg'>{currProject.owner.type}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="text-white !p-1 rounded-sm bg-slate-600">
                                        <UserRoundX className="h-4 w-4" />
                                    </div>
                                    <div className="text-white !p-1 rounded-sm bg-slate-600">
                                        <UserRoundPen className="h-4 w-4"/>
                                    </div>
                                </div>
                            </div> : <></>
                        }
                        {currProject.collaborators.map((collab, index) => {
                            return (
                                <div key={index} className="flex w-[100%] items-center gap-8 !p-2 bg-slate-50"> 
                                    <div className="flex items-center gap-2">
                                        <Profile name={collab.name} width={7} textSize={"md"}/>
                                        <div className="flex flex-col items-start justify-center">
                                            <p className="text-md">{collab.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className='text-sm text-slate-600'>{collab.email}</p>
                                                <p className='text-xs bg-black text-white !px-2 rounded-lg'>{collab.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={`text-white !p-1 rounded-sm ${currProject?.owner?.userId !== userId ? "bg-slate-600" : "bg-black hover:bg-slate-600 cursor-pointer"}`}>
                                            <UserRoundX className="h-4 w-4" onClick={() => currProject?.owner?.userId === userId ? handleCollaboratorDelete(collab.userId): ""} />
                                        </div>
                                        <div className={`text-white !p-1 rounded-sm ${currProject?.owner?.userId !== userId ? "bg-slate-600" : "bg-black hover:bg-slate-600 cursor-pointer"}`}>
                                            <UserRoundPen className="h-4 w-4" onClick={() => {
                                                if(currProject?.owner?.userId === userId){
                                                    collaborator.userId = collab.userId;
                                                    collaborator.email = collab.email;
                                                    collaborator.type = collab.type;
                                                    collaborator.name = collab.name;
                                                    setAddOrUpdateMode(UPDATE_MODE);
                                                    setInviteDialogVisible(true);
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Dialog header={`${addOrUpdateMode === ADD_MODE ? "Add" : "Update"} Collaborator`} visible={inviteDialogVisible} className='bg-white shadow-md rounded-2xl z-100 !p-6' onHide={() => {if (!inviteDialogVisible) return; setInviteDialogVisible(false); }} >
                <Invite addOrUpdateMode={addOrUpdateMode} collaborator={collaborator} setCollaborator={setCollaborator} handleAddOrUpdateCollaborator={handleAddOrUpdateCollaborator} />
            </Dialog>
        </div>
    )
}

export default Collaborators