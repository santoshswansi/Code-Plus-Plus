"use client"
import React, {useState, useEffect} from 'react'
import CodeEditor from './CodeEditor'
import { DEBOUNCED_CALLBACK_MS, ERROR, UNSAVED, CODE, PLAYGROUND_PROJECT_ID, SAVED, SAVING } from "@/constants";


import { Splitter, SplitterPanel } from 'primereact/splitter';
import CodeRunner from './CodeRunner';
import TabContainer from './TabContainer';
import { useDebouncedCallback } from "use-debounce";
import { handleUpdateCodeTabToProject } from "@/api/project";
import useGlobalStore from '@/store/useGlobalStore';

function CodeEditorWrapper() {
    const [output, setOutput] = useState("");
    const [input, setInput] = useState("");
    const { currProject, updateCodeTab, setSaveStatus } = useGlobalStore();

    const currTab = currProject.codeTabs[currProject.currCodeTabIdx];
    const codeTabId = currTab.codeTabId;
    const projectId = currProject.projectId;
    
    const saveToBackend = async (code) => {
        if(currProject.projectId === PLAYGROUND_PROJECT_ID)
            return;
        setSaveStatus(SAVING);
        const success = await handleUpdateCodeTabToProject(
            projectId,
            codeTabId,
            currTab.language,
            code
        );

        if(success){
            setSaveStatus(SAVED);
        }else{
            setSaveStatus(ERROR);
        }
    };

    const debouncedSave = useDebouncedCallback(saveToBackend, DEBOUNCED_CALLBACK_MS);

    const handleCodeChange = (newCode) => {
        if(!newCode || newCode === currTab.code) return;
        setSaveStatus(UNSAVED);

        updateCodeTab(codeTabId, {
        language: currTab.language,
        code: newCode,
        });

        if(currProject.projectId !== PLAYGROUND_PROJECT_ID)
            debouncedSave(newCode);
    };

    useEffect(() => {
        return () => debouncedSave.cancel();
    }, [debouncedSave]);

    return (
        <div className="h-[100vh] w-[100%] !border-0)">
            <CodeRunner input={input} setOutput={setOutput} handleCodeChange={handleCodeChange} />
            <Splitter className="!border-0">
                <SplitterPanel><div className="h-[calc(100vh-35px)]"><CodeEditor handleCodeChange={handleCodeChange} /></div></SplitterPanel>
                <SplitterPanel>
                    <Splitter layout="vertical">
                        <SplitterPanel className="w-[100%] bg-[#1E1E1E]"><div className="relative w-[100%] h-[100%]"><span className="absolute !mt-2 !ml-2 bg-slate-200 text-black h-7 w-17 rounded-sm !border-0 flex items-center justify-center font-(family-name:--font-space-grotesk)">Input</span><textarea type="text" className="w-[100%] h-[100%] !pt-12 !px-2 text-slate-200 focus:outline-none resize-none" onChange={(e) => setInput(e.target.value)} /></div></SplitterPanel>
                        <SplitterPanel className="w-[100%] bg-[#1E1E1E]"><div className="relative w-[100%] h-[100%]"><span className="absolute !mt-2 !ml-2 bg-slate-200 text-black h-7 w-17 rounded-sm flex items-center justify-center font-(family-name:--font-space-grotesk)">Output</span><pre className="w-[100%] h-[100%] !pt-12 !px-2 text-slate-200">{output}</pre></div></SplitterPanel>
                    </Splitter>
                </SplitterPanel>
            </Splitter>
            <div className="fixed bottom-2 right-2">
                <TabContainer codeOrWhiteboard={CODE} />
            </div>
        </div>
    )
}

export default CodeEditorWrapper