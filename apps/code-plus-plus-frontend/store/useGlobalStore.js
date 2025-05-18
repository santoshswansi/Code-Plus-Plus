"use client";
import { DEFAULT_TAB_MODE, PLAYGROUND_PROJECT_ID, PLAYGROUND_PROJECT_NAME, PLAYGROUND_PROJECT_SUBTITLE, SAVED } from "@/constants";
import { DEFAULT_CODE, DEFAULT_LANGUAGE, DEFAULT_WHITEBOARD } from "../../../packages/constants";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

let playgroundProject = {
        projectId: PLAYGROUND_PROJECT_ID,
        name: PLAYGROUND_PROJECT_NAME,
        subtitle: PLAYGROUND_PROJECT_SUBTITLE,
        collaborators: [],
        codeTabs: [{ codeTabId: uuidv4(), language: DEFAULT_LANGUAGE, code: DEFAULT_CODE[DEFAULT_LANGUAGE] }],
        whiteboardTabs: [{ whiteboardTabId: uuidv4(), ...DEFAULT_WHITEBOARD }],
        currCodeTabIdx: 0,
        currWhiteboardTabIdx: 0
    };

const useGlobalStore = create((set) => ({
    tab: DEFAULT_TAB_MODE,
    setTab: (newTab) => set({ tab: newTab }),
    currPage: 1,
    setCurrPage: (newPage) => set({currPage: newPage}),
    saveStatus: SAVED,
    setSaveStatus: (newSaveStatus) => set({saveStatus: newSaveStatus}),
    isProjectsFetching: false,
    setIsProjectsFetching: (newIsProjectsFetching) => set({isProjectsFetching: newIsProjectsFetching}),
    currUserHasEditAccessRightToCurrProject: true,
    setCurrUserHasEditAccessRightToCurrProject: (value) => set({currUserHasEditAccessRightToCurrProject: value}),

    projects: [],
    setProjects: (newProjects) => set({projects: newProjects}),
    updateProject: (projectId, updatedProject) => set((state) => {
        const updatedProjects = state.projects.map((project) => {
            if(project.projectId === projectId){
                return { ...project, ...updatedProject };
            }
            
            return project;
        });

        return { projects: updatedProjects };
    }),
    deleteProject: (projectId) => set((state) => {
        const updatedProjects = state.projects.filter((project) => {
            return project.projectId !== projectId
        });

        return { projects: updatedProjects };
    }),
    addNewProject: (newProject) => set((state) => ({ projects: [newProject, ...state.projects] })),

    playgroundProject: playgroundProject,
    setPlaygroundProject: (newPlaygroundProject) => set({playgroundProject: newPlaygroundProject}),

    currProject: playgroundProject,
    updateCurrProject: (updatedProject) => set((state) => ({currProject: {...state.currProject, ...updatedProject}})),
    setCurrProject: (newProject) => set({currProject: newProject}),   
    
    setCurrCodeTabIdx: (index) =>
        set((state) => ({
            currProject: { ...state.currProject, currCodeTabIdx: Math.min(index, state.currProject.codeTabs.length-1) }
        })),

    setCurrWhiteboardTabIdx: (index) =>
        set((state) => ({
            currProject: { ...state.currProject, currWhiteboardTabIdx: Math.min(index, state.currProject.whiteboardTabs.length-1) }
        })),

    addCodeTab : (tab) => set((state) => ({
        currProject: {...state.currProject, codeTabs: [...state.currProject.codeTabs, tab], currCodeTabIdx: state.currProject.codeTabs.length}
    })),

    addWhiteboardTab : (tab) => set((state) => ({
        currProject: {...state.currProject, whiteboardTabs: [...state.currProject.whiteboardTabs, tab], currWhiteboardTabIdx: state.currProject.whiteboardTabs.length}
    })),

    deleteCodeTab: (codeTabId) =>
        set((state) => {
            const { codeTabs, currCodeTabIdx } = state.currProject;
            if(codeTabs.length === 1) return state;

            const updatedTabs = codeTabs.filter((tab) => tab.codeTabId !== codeTabId);
            const newIdx = Math.min(currCodeTabIdx, updatedTabs.length - 1);

            return {
                currProject: {
                    ...state.currProject,
                    codeTabs: updatedTabs,
                    currCodeTabIdx: newIdx,
                },
            };
        }),

    deleteWhiteboardTab: (whiteboardTabId) =>
        set((state) => {
            const { whiteboardTabs, currWhiteboardTabIdx } = state.currProject;
            if(whiteboardTabs.length === 1) return state;

            const updatedTabs = whiteboardTabs.filter((tab) => tab.whiteboardTabId !== whiteboardTabId);
            const newIdx = Math.min(currWhiteboardTabIdx, updatedTabs.length - 1);

            return {
                currProject: {
                    ...state.currProject,
                    whiteboardTabs: updatedTabs,
                    currWhiteboardTabIdx: newIdx,
                },
            };
        }),

    updateCodeTab: (codeTabId, updates) =>
        set((state) => ({
        currProject: {
            ...state.currProject,
            codeTabs: state.currProject.codeTabs.map((tab) =>
                tab.codeTabId === codeTabId ? { ...tab, ...updates} : tab
            )
        }
        })),

    updateWhiteboardTab: (whiteboardTabId, updates) =>
        set((state) => ({
        currProject: {
            ...state.currProject,
            whiteboardTabs: state.currProject.whiteboardTabs.map((tab) =>
                tab.whiteboardTabId === whiteboardTabId ? {...tab, ...updates} : tab
            )
        }
        })),

    addCollaborator: (collaborator) => set((state) => ({
        currProject: {...state.currProject, collaborators: [...state.currProject.collaborators, collaborator]}
    })),

    updateCollaborator: (userId, updates) =>
        set((state) => ({
        currProject: {
            ...state.currProject,
            collaborators: state.currProject.collaborators.map((collaborator) =>
                collaborator.userId === userId ? {...collaborator, ...updates} : collaborator
            )
        }
        })),

    deleteCollaborator: (userId) => set((state) => {
        if(state.currProject.collaborators.length === 1) return state;
        const updatedCollaborators = state.currProject.collaborators.filter((currCollaborator) => currCollaborator.userId !== userId);
        return{
            currProject: {
                ...state.currProject,
                collaborators: updatedCollaborators,
            },
        };
    }),

    setDefault: () => set((state) => ({
        isProjectsFetching: false,
        currPage: 1,
        projects: [],
        currProject: state.playgroundProject,
    }))
}));

export default useGlobalStore;