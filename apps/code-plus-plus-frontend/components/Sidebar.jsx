"use client";
import React from 'react';
import { Code, Pen, Users, Settings, Folder } from 'lucide-react';
import { CODE, WHITEBOARD, COLLABORATORS, SETTINGS, TAB_TO_ROUTE, PROJECTS } from '@/constants';
import { redirect } from 'next/navigation'
import useGlobalStore from '@/store/useGlobalStore';

function Sidebar() {
    const {tab, setTab} = useGlobalStore();

    const handleClick = (currTab) => {
        setTab(currTab);
        redirect(TAB_TO_ROUTE[currTab])
    }

    return (
        <div className="flex flex-col items-center gap-2 h-[100vh] w-10 bg-black text-slate-200 !pt-2">
            <div className={`h-6 w-6 cursor-pointer rounded-sm flex items-center justify-center ${tab === CODE ? "bg-indigo-500 text-white": ""}`} onClick={(e) => handleClick(CODE)}><Code width={20} /></div>
            <div className={`h-6 w-6 cursor-pointer rounded-sm flex items-center justify-center ${tab === WHITEBOARD ? "bg-indigo-500 text-white": ""}`} onClick={(e) => handleClick(WHITEBOARD)}><Pen width={20} /></div>
            <div className={`h-6 w-6 cursor-pointer rounded-sm flex items-center justify-center ${tab === COLLABORATORS ? "bg-indigo-500 text-white": ""}`} onClick={(e) => handleClick(COLLABORATORS)}><Users width={20} /></div>
            <div className={`h-6 w-6 cursor-pointer rounded-sm flex items-center justify-center ${tab === SETTINGS ? "bg-indigo-500 text-white": ""}`} onClick={(e) =>  handleClick(SETTINGS)}><Settings width={20} /></div>
            <div className={`h-6 w-6 cursor-pointer rounded-sm flex items-center justify-center ${tab === PROJECTS ? "bg-indigo-500 text-white": ""}`} onClick={(e) =>  handleClick(PROJECTS)}><Folder width={20} /></div>
        </div>
    )
}


export default Sidebar