"use client"
import React from 'react'
import { UserPlus, UserRoundPen } from "lucide-react";
import { EDITOR, VIEWER } from "../../../packages/constants/index";
import { ADD_MODE, UPDATE_MODE } from '@/constants';

function Invite({addOrUpdateMode, collaborator, setCollaborator, handleAddOrUpdateCollaborator}) {
    return (
        <div className="flex flex-col gap-4 h-75 w-80 bg-white rounded-sm !mt-2">
            <div className="flex flex-col w-[100%]">
                <label htmlFor="email" className="text-slate-500">Email</label>
                <input type="email" id="email" value={collaborator.email} placeholder="Enter collaborator email" className="!p-1 bg-slate-100 rounded-sm focus:outline-none" onChange={(e) => { addOrUpdateMode === ADD_MODE ? setCollaborator({...collaborator, email: e.target.value}) : "" }} />
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-slate-500">Type</p>
                <div className="flex flex-col gap-2">
                    <div className={`bg-slate-100 rounded-sm !p-2 ${collaborator.type === EDITOR ? "!bg-black text-white" : "cursor-pointer"}`} onClick={() => setCollaborator({...collaborator, type: EDITOR})}>
                        <p>Editor</p>
                        <p className={`text-slate-500 ${collaborator.type === EDITOR ? "!text-slate-300" : ""}`}>Can edit the project</p>
                    </div>
                    <div className={`bg-slate-100 rounded-sm !p-2 ${collaborator.type === VIEWER ? "!bg-black text-white" : "cursor-pointer"}`} onClick={() => setCollaborator({...collaborator, type: VIEWER})}>
                        <p>Viewer</p>
                        <p className={`text-slate-500 ${collaborator.type === VIEWER ? "!text-slate-300" : ""}`}>Can only view the project</p>
                    </div>
                </div>
            </div>
            <div onClick={() => handleAddOrUpdateCollaborator()} className="flex gap-2 rounded-sm text-white bg-indigo-600 items-center justify-center h-7 cursor-pointer hover:bg-indigo-500">
                {
                    addOrUpdateMode === ADD_MODE ?
                    <UserPlus className="h-4 w-4" /> :
                    <UserRoundPen className="h-4 w-4" />
                }
                <p>{`${ addOrUpdateMode === UPDATE_MODE ? "Update Collaborator" : "Send Invitation"}`}</p>
            </div>
        </div>
    )
}

export default Invite