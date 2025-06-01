import * as http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import { encodeStateAsUpdate, applyUpdate } from "yjs";
import { URL } from "url";
import ky from "ky";
import { APIResponsePermission, JwtPayload, APIResponse } from "../../packages/types/index.ts";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { WS_BAD_REQUEST, WS_FORBIDDEN, WS_INTERNAL_ERROR, WS_UNAUTHORIZED } from "./constants/index.ts";
import { WHITEBOARD, CODE, OWNER, EDITOR} from "../../packages/constants/index.ts";

const PORT = process.env.PORT || 3300;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_GATEWAY_BASE_URL = process.env.API_GATEWAY_BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET as string;

const docs: Map<string, Y.Doc> = new Map();

const verifyToken = (token: string | null): JwtPayload | null => {
  if(!token) 
    return null;
  
  try{
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if(typeof payload === "object" && "userId" in payload) {
      return payload;
    }

    return null;
  }catch{
    return null;
  }
};

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", async (ws: WebSocket, req) => {
  let canEdit = false;

  try{
    const requestUrl = req.url ?? "";
    const url = new URL(requestUrl, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    const projectId = url.searchParams.get("projectId");
    const tabType = url.searchParams.get("tabType");
    const payload = verifyToken(token);

    if(!payload || !projectId){
      ws.close(WS_UNAUTHORIZED, "Unauthorized");
      return;
    }

    const userId = payload.userId;
    let permResp: APIResponse;
    try{
      permResp = (await ky.get(`${API_GATEWAY_BASE_URL}/projects/${projectId}/collaborators/${userId}/permission`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).json()) as APIResponse;
    }catch{
      ws.close(WS_FORBIDDEN, "Forbidden");
      return;
    }

    const userType = (permResp.data as { type: string }).type;
    if(userType === OWNER || userType === EDITOR){
      canEdit = true;
    }

    const docId = url.pathname.slice(1); 
    let yDoc = docs.get(docId);
    if(!yDoc){
      yDoc = new Y.Doc();
      docs.set(docId, yDoc);

      let tabResp: APIResponse;
      try{
        let url;
        if(tabType === WHITEBOARD)
          url = `${API_GATEWAY_BASE_URL}/projects/${projectId}/whiteboardTabs/${docId}`;
        else if(tabType === CODE)
          url = `${API_GATEWAY_BASE_URL}/projects/${projectId}/codeTabs/${docId}`;
        else{
          ws.close(WS_BAD_REQUEST, "Tab type does not match");
          return;
        }

        tabResp = (await ky.get(url,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ).json()) as APIResponse;
      }catch{
        ws.close(WS_INTERNAL_ERROR, "Failed to fetch tab");
        return;
      }

      if(tabType === WHITEBOARD){
        const tabData = tabResp.data as { whiteboardTabId: string; shapes: unknown[] };
        if (Array.isArray(tabData.shapes) && tabData.shapes.length > 0) {
          const yShapes = yDoc.getArray("shapes");
          yShapes.insert(0, tabData.shapes);
        }
      }
    }

    const initState = encodeStateAsUpdate(yDoc);
    ws.send(initState);

    const broadcastUpdate = (update: Uint8Array) => {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(update);
        }
      });
    };

    yDoc.on("update", broadcastUpdate);

    ws.on("message", (message: Buffer) => {
      if(!canEdit) return;
      const update = new Uint8Array(message);
      applyUpdate(yDoc, update);
    });

    ws.on("close", () => {
      yDoc.off("update", broadcastUpdate);
    });
  }catch(err){
    ws.close(WS_INTERNAL_ERROR, "Internal Error");
  }
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});