"use client";
import { CODE, PLAYGROUND_PROJECT_ID } from '@/constants';
import useGlobalStore from '@/store/useGlobalStore';
import { MAX_TABS_ALLOWED } from "../../../packages/constants";
import React from 'react';
import { toast } from 'sonner';
import { handleAddCodeTabToProject, handleAddWhiteboardTabToProject, handleDeleteCodeTabOfProject, handleDeleteWhiteboardTabOfProject } from '@/api/project';

function TabContainer({codeOrWhiteboard}) {
    const {currProject, setCurrCodeTabIdx, setCurrWhiteboardTabIdx, currUserHasEditAccessRightToCurrProject} = useGlobalStore();
    
    const tabs = codeOrWhiteboard === CODE ? currProject.codeTabs : currProject.whiteboardTabs;
    const handleTabAdd = async () => {
        if(currProject.projectId === PLAYGROUND_PROJECT_ID){
            return;
        }

        if(tabs.length === MAX_TABS_ALLOWED){
            toast.info("Maximum limit of tabs reached");
            return;
        }

        if(codeOrWhiteboard === CODE){
            await handleAddCodeTabToProject(currProject.projectId);
        }else{ 
            await handleAddWhiteboardTabToProject(currProject.projectId);
        }
    };

    const isAddingTabAllowed = () => {
        return tabs.length !== MAX_TABS_ALLOWED && currProject.projectId !== PLAYGROUND_PROJECT_ID && currUserHasEditAccessRightToCurrProject
    }

    const handleTabDelete = (e, tab) => {
        e.stopPropagation();
        if(codeOrWhiteboard === CODE){
            if(currProject.codeTabs.length === 1) return;
            handleDeleteCodeTabOfProject(currProject.projectId, tab.codeTabId);
        }else{ 
            if(currProject.whiteboardTabs.length === 1) return;
            handleDeleteWhiteboardTabOfProject(currProject.projectId, tab.whiteboardTabId);
        }
    }

    return (
        <div className="flex items-center justify-center h-[45] w-min bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-md gap-3 !px-2">
            {
                tabs.map((tab, index) => {
                    return (<div key={index} className={`!font-(family-name:--font-space-grotesk) relative flex items-center justify-center h-7 w-7 shadow-[0px_0px_10px_rgba(0,0,0,0.13)] rounded-sm text-md border border-slate-300 ${ index === (codeOrWhiteboard === CODE ? currProject.currCodeTabIdx: currProject.currWhiteboardTabIdx) ? "bg-slate-200": "cursor-pointer"}`} 
                                onClick={(e) => {
                                    (codeOrWhiteboard === CODE ?  setCurrCodeTabIdx(index) : setCurrWhiteboardTabIdx(index))
                                }} 
                           >
                        {index + 1}
                        {
                            tabs.length !== 1 &&
                            <div className="absolute -top-1 -right-1 h-[13] w-[13] rounded-full bg-black text-white text-xs flex items-center justify-center cursor-pointer" onClick={(e) => handleTabDelete(e, tab, index)}>
                                x
                            </div>
                        }
                    </div>)
                })
            }
            <div className={`flex items-center justify-center h-7 w-7 rounded-sm shadow-[0px_0px_10px_rgba(0,0,0,0.13)] text-white text-lg 
                     ${ isAddingTabAllowed() ? "cursor-pointer bg-black" : "bg-slate-500"}`} 
                onClick={() => isAddingTabAllowed() && handleTabAdd()}>+</div>
        </div>
    )
}

export default TabContainer