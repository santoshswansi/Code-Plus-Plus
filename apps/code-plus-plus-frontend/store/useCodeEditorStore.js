"use client"
import { DEFAULT_AUTO_SAVE, DEFAULT_EDITOR_THEME, DEFAULT_FONT_SIZE, DEFAULT_MINIMAP, DEFAULT_TAB_MODE, DEFAULT_TAB_SIZE } from "@/constants";
import { create } from "zustand";

const useCodeEditorStore = create((set) => ({
  autoSave: DEFAULT_AUTO_SAVE,
  setAutoSave: (newAutoSave) => set({ autoSave: newAutoSave }),
  
  minimap: DEFAULT_MINIMAP,
  setMinimap: (newMinimap) => set({ minimap: newMinimap }),

  theme: DEFAULT_EDITOR_THEME,
  setTheme: (newTheme) => set({ theme: newTheme }),

  fontSize: DEFAULT_FONT_SIZE,
  setFontSize: (newFontSize) => set({ fontSize: newFontSize }),

  tabSize: DEFAULT_TAB_SIZE,
  setTabSize: (newTabSize) => set({ tabSize: newTabSize }),

  tabs: [],
  setTabs: (newTab) => set({tabs: [...tabs, newTab]}),

  setDefault: () => set({
    autoSave: DEFAULT_AUTO_SAVE,
    minimap: DEFAULT_MINIMAP,
    theme: DEFAULT_EDITOR_THEME,
    fontSize: DEFAULT_FONT_SIZE,
    tabSize: DEFAULT_TAB_SIZE,
    tabs: [],
  })
}));

export default useCodeEditorStore;