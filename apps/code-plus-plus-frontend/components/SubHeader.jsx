"use client"
import React, { useState } from 'react'
import Profile from './Profile'
import { UserPlus, LayoutDashboard } from 'lucide-react'
import { ADD_MODE, COLLABORATORS, PLAYGROUND_PROJECT_ID, TAB_TO_ROUTE } from '@/constants'
import { redirect } from 'next/navigation'
import { Dialog } from 'primereact/dialog'
import Invite from './Invite'
import useGlobalStore from '@/store/useGlobalStore'
import { VIEWER } from 'constants'
import { handleAddCollaboratorOfProject, handleUpdateCollaboratorOfProject } from '@/api/project'
import useAuthStore from '@/store/useAuthStore'

function SubHeader() {
  const [inviteDialogVisible, setInviteDialogVisible] = useState(false);
  const {currProject, saveStatus} = useGlobalStore();
  const {userId} = useAuthStore();
  const [addOrUpdateMode, setAddOrUpdateMode] = useState(ADD_MODE); 
  const [collaborator, setCollaborator] = useState({email: "", userId: "", type: VIEWER});

  const handleAddOrUpdateCollaborator = async () => {
      if(currProject.projectId === PLAYGROUND_PROJECT_ID)
          return;

      setInviteDialogVisible(true);
      if(addOrUpdateMode == ADD_MODE){
          const res = await handleAddCollaboratorOfProject(currProject.projectId, collaborator.email, collaborator.type);
          if(res)    setInviteDialogVisible(false);
      }else{
          const res = await handleUpdateCollaboratorOfProject(currProject.projectId, collaborator?.userId, collaborator?.type);
          if(res)    setInviteDialogVisible(false);
      }
  };

  return (
    <div className="flex items-center justify-between w-screen h-20 bg-slate-200 !px-6 !py-1 font-(family-name:--font-space-grotesk)">
        <div className="flex items-center justify-center gap-2">
            <div className="text-lg flex items-center justify-center gap-2">
              <LayoutDashboard className="h-7 w-7"/> 
              <p>{currProject.name}</p>
            </div>
            {
              currProject.projectId !== PLAYGROUND_PROJECT_ID ?
              <>
                <div className="text-sm bg-green-500 !px-2 !py-1 rounded-xl text-white flex items-center justify-center">Live</div> 
                <div className="text-sm text-white rounded-xl bg-black !px-2 !py-1 flex items-center justify-center">{saveStatus}</div>
              </>
              : <></>
            }
        </div>
        
        <div className="flex items-center justify-between">
          {currProject.projectId != PLAYGROUND_PROJECT_ID && (
            <div
              className="flex items-center cursor-pointer"
              onClick={() => redirect(TAB_TO_ROUTE[COLLABORATORS])}
            >
              <div>
                  <Profile name={currProject.owner.name} width={7} textSize="md" />
              </div>
              {currProject.collaborators.slice(0, 2).map((collab, index) => (
                <div key={index} className="!-ml-3">
                  <Profile name={collab.name} width={7} textSize="md" />
                </div>
              ))}

              {currProject.collaborators.length > 2 && (
                <div className="!-ml-3 h-[31] w-[31] flex items-center justify-center bg-black text-white rounded-full text-xs font-medium">
                  +{currProject.collaborators.length - 2}
                </div>
              )}
            </div>
          )}
          <div className={`flex gap-1 items-center justify-center rounded-md text-white h-7 w-20 ${currProject.projectId !== PLAYGROUND_PROJECT_ID && currProject?.owner?.userId === userId ? "cursor-pointer bg-indigo-600" : "bg-indigo-300"} !ml-2`} 
               onClick={() => {
                 if(currProject.projectId !== PLAYGROUND_PROJECT_ID && currProject?.owner?.userId === userId){
                    setInviteDialogVisible(true);
                    setAddOrUpdateMode(ADD_MODE);
                    setCollaborator({email: "", userId: "", type: VIEWER});
                 }
               }}
          >
               <UserPlus className="h-4 w-4 !font-(family-name:--font-space-grotesk)" /> Invite
          </div>    
        </div>

        <Dialog header="Invite Collaborator" visible={inviteDialogVisible} className='bg-white shadow-md rounded-2xl z-100 !p-6 !font-(family-name:--font-space-grotesk)' onHide={() => {if (!inviteDialogVisible) return; setInviteDialogVisible(false); }} >
          <Invite addOrUpdateMode={addOrUpdateMode} collaborator={collaborator} setCollaborator={setCollaborator} handleAddOrUpdateCollaborator={handleAddOrUpdateCollaborator} />
        </Dialog>
    </div>
  )
}

export default SubHeader