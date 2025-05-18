"use client"
import React, { useEffect } from 'react'
import { Dropdown } from 'primereact/dropdown';
import { LANGUAGE_TO_FILE_EXTENSION } from '@/constants';
import { DEFAULT_CODE, LANGUAGES } from "../../../packages/constants/index";
import {Play, RotateCw, ArrowDownToLine} from "lucide-react";
import { runCode } from '@/api/codeExecuter';
import useGlobalStore from '@/store/useGlobalStore';

function CodeRunner({setOutput, input, handleCodeChange}) {
    const languages = LANGUAGES;
    const {currProject, updateCodeTab, currUserHasEditAccessRightToCurrProject} = useGlobalStore();

    const currTab = currProject.codeTabs[currProject.currCodeTabIdx];
    const downloadCode = () => {
        const blob = new Blob([currTab.code], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "code" + LANGUAGE_TO_FILE_EXTENSION[currTab.language]; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCodeExecute = () => {
        const op = runCode(currTab.language, currTab.code, input);
        setOutput(op);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if((event.ctrlKey || event.metaKey)){

                if(event.key === "s"){
                    event.preventDefault(); 
                    downloadCode();
                }

                if(event.key === "r" && currUserHasEditAccessRightToCurrProject){
                    event.preventDefault(); 
                    handleCodeChange(DEFAULT_CODE[currTab.language]);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="flex items-center justify-between !px-4 !py-2 w-[100%] h-[35] bg-black text-slate-200 !border-0">
            <div>
                <Dropdown 
                    value={currTab.language} 
                    onChange={(e) => updateCodeTab(currTab.codeTabId, {language: e.value, code: currTab.code})} 
                    options={languages} optionLabel="language" 
                    className="w-35 h-6 bg-slate-200 text-black rounded-sm !px-1" 
                    panelClassName="bg-slate-200 !px-1 rounded-sm !active:outline-none"    
                />
            </div>
            <section className="flex items-center justify-between gap-2">
                <Play className="h-5 w-5 cursor-pointer" onClick={() => handleCodeExecute()} />
                <RotateCw className="h-5 w-5 cursor-pointer" onClick={() => handleCodeChange(DEFAULT_CODE[currTab.language])} />
                <ArrowDownToLine className="h-5 w-5 cursor-pointer" onClick={() => downloadCode()} />
            </section>
        </div>
    )
}

export default CodeRunner