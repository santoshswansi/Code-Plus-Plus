"use client"
import React from 'react';
import {EDITOR_DARK, EDITOR_FONT_SIZE_1, EDITOR_FONT_SIZE_2, EDITOR_FONT_SIZE_3, EDITOR_LIGHT, EDITOR_TAB_SIZE_1, EDITOR_TAB_SIZE_2 } from '@/constants';
import useCodeEditorStore from '@/store/useCodeEditorStore';

function Settings() {
    const {theme, setTheme, fontSize, setFontSize, tabSize, setTabSize, autoSave, setAutoSave, minimap, setMinimap} = useCodeEditorStore();

    return (
        <div className="flex flex-col gap-4 font-(family-name:--font-space-grotesk)">
            <p className="!mx-6 !mt-3 text-lg">Settings</p>
            <div className="w-[100%]">
                <div className="flex flex-col !mx-6 gap-3 rounded-sm shadow-[0px_0px_10px_rgba(0,0,0,0.13)] !p-3">
                    <p>Editor Preferences</p>
                    <hr className="text-slate-300" />
                    <div className="flex flex-col gap-4">
                       <div className="grid grid-cols-8">
                            <p>Theme</p>
                            <div className="flex gap-4">
                                <span className={`rounded-sm h-7 w-12 flex items-center justify-center bg-slate-100 cursor-pointer ${theme === EDITOR_LIGHT && "!bg-black text-white"}`} onClick={() => setTheme(EDITOR_LIGHT)}>Light</span>
                                <span className={`rounded-sm h-7 w-12 flex items-center justify-center bg-slate-100 cursor-pointer ${theme === EDITOR_DARK && "!bg-black text-white"}`} onClick={() => setTheme(EDITOR_DARK)}>Dark</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Font Size</p>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm rounded-sm h-7 w-7 flex items-center justify-center bg-slate-100 cursor-pointer ${fontSize === EDITOR_FONT_SIZE_1 && "!bg-black text-white"}`} onClick={() => setFontSize(EDITOR_FONT_SIZE_1)}>A</span>
                                <span className={`text-lg rounded-sm h-7 w-7 flex items-center justify-center bg-slate-100 cursor-pointer ${fontSize === EDITOR_FONT_SIZE_2 && "!bg-black text-white"}`} onClick={() => setFontSize(EDITOR_FONT_SIZE_2)}>A</span>
                                <span className={`text-xl rounded-sm h-7 w-7 flex items-center justify-center bg-slate-100 cursor-pointer ${fontSize === EDITOR_FONT_SIZE_3 && "!bg-black text-white"}`} onClick={() => setFontSize(EDITOR_FONT_SIZE_3)}>A</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Tab Size</p>
                            <div className="flex items-center gap-4">
                                <span className={`rounded-sm h-7 w-12 flex items-center justify-center bg-slate-100 cursor-pointer ${tabSize === EDITOR_TAB_SIZE_1 && "!bg-black text-white"}`} onClick={() => setTabSize(EDITOR_TAB_SIZE_1)}>{">"}</span>
                                <span className={`rounded-sm h-7 w-12 flex items-center justify-center bg-slate-100 cursor-pointer ${tabSize === EDITOR_TAB_SIZE_2 && "!bg-black text-white"}`} onClick={() => setTabSize(EDITOR_TAB_SIZE_2)}>{">>"}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Auto-save</p>
                            <div className="flex" onClick={() => setAutoSave(!autoSave)}>
                                <div className={`h-7 w-10 cursor-pointer rounded-ss-xl rounded-es-xl flex items-center justify-center ${!autoSave ? "bg-black text-white": "bg-slate-100 text-black"}`}>OFF</div>
                                <div className={`h-7 w-10 cursor-pointer rounded-se-xl rounded-ee-xl flex items-center justify-center ${autoSave ? "bg-black text-white": "bg-slate-100 text-black"}`}>ON</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Mini-map</p>
                            <div className="flex" onClick={() => setMinimap(!minimap)}>
                                <div className={`h-7 w-10 cursor-pointer rounded-ss-xl rounded-es-xl flex items-center justify-center ${!minimap ? "bg-black text-white": "bg-slate-100 text-black"}`}>OFF</div>
                                <div className={`h-7 w-10 cursor-pointer rounded-se-xl rounded-ee-xl flex items-center justify-center ${minimap ? "bg-black text-white": "bg-slate-100 text-black"}`}>ON</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-[100%]">
                <div className="flex flex-col !mx-6 gap-3 rounded-sm shadow-[0px_0px_10px_rgba(0,0,0,0.13)] !p-3">
                    <p>Shortcuts</p>
                    <hr className="text-slate-300" />
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-8">
                            <p>Run</p>
                            <p className="rounded-sm h-7 w-28 bg-slate-100 flex items-center justify-center"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></p>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Save File</p>
                            <p className="rounded-sm h-7 w-28 bg-slate-100 flex items-center justify-center"><kbd>Ctrl</kbd> + <kbd>S</kbd></p>
                        </div>
                        <div className="grid grid-cols-8">
                            <p>Reset File</p>
                            <p className="rounded-sm h-7 w-28 bg-slate-100 flex items-center justify-center"><kbd>Ctrl</kbd> + <kbd>R</kbd></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
