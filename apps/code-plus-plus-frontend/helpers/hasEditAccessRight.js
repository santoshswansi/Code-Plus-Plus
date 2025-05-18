import { PLAYGROUND_PROJECT_ID } from "@/constants";
import { EDITOR } from "./../../../packages/constants";

const { default: useAuthStore } = require("@/store/useAuthStore");
const { default: useGlobalStore } = require("@/store/useGlobalStore");

const authStore = useAuthStore;
const globalStore = useGlobalStore;
export const currUserHasEditAccessRightToCurrProjectHelper = () => {
    if(globalStore.getState().currProject.projectId === PLAYGROUND_PROJECT_ID)
        return true;
    return globalStore.getState().currProject?.owner?.userId === authStore.getState()?.userId || globalStore.getState()?.currProject?.collaborators.some((collab) => collab.userId === authStore.getState()?.userId && collab.type === EDITOR);
}