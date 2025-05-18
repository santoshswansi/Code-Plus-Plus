import express, { RequestHandler } from "express";
import { 
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCodeTab,
  addWhiteboardTab,
  updateCodeTab,
  updateWhiteboardTab,
  deleteCodeTab,
  deleteWhiteboardTab,
  addCollaborator,
  removeCollaborator,
  updateCollaborator
} from "../controllers/projectControllers.ts";
import {isProtected} from "../../../packages/middlewares/index.ts"

const router = express.Router();

router.post("/", isProtected as any, createProject as RequestHandler);
router.get("/", isProtected as any, getProjects);
router.get("/:projectId", isProtected as any, getProjectById);
router.put("/:projectId", isProtected as any, updateProject as RequestHandler);
router.delete("/:projectId", isProtected as any, deleteProject);
router.post("/:projectId/code-tabs", isProtected as any, addCodeTab as RequestHandler);
router.post("/:projectId/whiteboard-tabs", isProtected as any, addWhiteboardTab as RequestHandler);
router.put("/:projectId/code-tabs/:codeTabId", isProtected as any, updateCodeTab as RequestHandler);
router.put("/:projectId/whiteboard-tabs/:whiteboardTabId", isProtected as any, updateWhiteboardTab as RequestHandler);
router.delete("/:projectId/code-tabs/:codeTabId", isProtected as any, deleteCodeTab);
router.delete("/:projectId/whiteboard-tabs/:whiteboardTabId", isProtected as any, deleteWhiteboardTab);
router.post("/:projectId/collaborators", isProtected as any, addCollaborator as RequestHandler);
router.put("/:projectId/collaborators/:userId", isProtected as any, updateCollaborator as RequestHandler);
router.delete("/:projectId/collaborators/:userId", isProtected as any, removeCollaborator);

export default router;