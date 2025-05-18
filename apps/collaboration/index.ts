import WebSocket, { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { applyUpdate } from 'yjs';
import { authMiddleware } from './middlewares/middlewares.ts';
import { accessControlMiddleware } from './middlewares/middlewares.ts';
import { WSContext, WSMiddleware } from './types/index.ts';
import { APIResponse, APIResponseProject } from "./../../packages/types/index.ts";
import "dotenv/config";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import ky from "ky";

const PORT = Number(process.env.PORT) || 1234;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const docs = new Map<string, Y.Doc>();
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const whiteboardTabId = url.pathname.split('/').pop() as string;
  const token = url.searchParams.get('token') as string;
  const projectId = url.searchParams.get("projectId") as string;

  const context: WSContext = { req, url, token, whiteboardTabId, projectId };
  const middlewares: WSMiddleware[] = [authMiddleware, accessControlMiddleware];

  let apiResponse: APIResponse;
  for(const middleware of middlewares){
    const ok = await middleware(ws, context);
    if(!ok){
      apiResponse = { success: false, message: 'Unauthorized or access denied' };
      ws.send(JSON.stringify(apiResponse));
      return;
    }
  }

  let ydoc = docs.get(whiteboardTabId);
  if(!ydoc){
    ydoc = new Y.Doc();
    docs.set(whiteboardTabId, ydoc);

    try{
      const response: APIResponseProject = await ky.get(`${process.env.API_GATEWAY_BASE_URL}/projects/${projectId}`).json();

      if(response.success){
        const whiteboardTab = response.data.whiteboardTabs.find((tab: any) => tab.whiteboardTabId === whiteboardTabId);

        if(Array.isArray(whiteboardTab?.yjsUpdate)){
          Y.applyUpdate(ydoc, Uint8Array.from(whiteboardTab.yjsUpdate));
        }
      }else{
        apiResponse = { success: false, message: response.message };
        ws.send(JSON.stringify(apiResponse));
      }
    }catch(err){
      apiResponse = { success: false, message: 'Failed to load whiteboard project data.' };
      ws.send(JSON.stringify(apiResponse));
    }
  }

  ws.on('message', (data) => {
    const msg = new Uint8Array(data as ArrayBuffer);
    if(msg[0] === 0){
      const clientStateVector = msg.slice(1);
      const diff = Y.encodeStateAsUpdate(ydoc, clientStateVector);
      ws.send(diff);
      return;
    }

    applyUpdate(ydoc, msg);
  });

  const updateHandler = async (update: Uint8Array) => {
    wss.clients.forEach((client) => {
      if(client !== ws && client.readyState === WebSocket.OPEN){
        client.send(update);
      }
    });

    try {
      const encoded = Y.encodeStateAsUpdate(ydoc);
      await ky.put(`${process.env.API_GATEWAY_BASE_URL}/projects/${projectId}/whiteboards/${whiteboardTabId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context.token}`,
        },
        json: { yjsUpdate: Array.from(encoded) },
      }).json();
    }catch(err){
      apiResponse = { success: false, message: 'Failed to persist whiteboard changes.'};
      ws.send(JSON.stringify(apiResponse));
    }
  };

  ydoc.on('update', updateHandler);

  ws.on('close', () => {
    ydoc!.off('update', updateHandler);
  });
});
