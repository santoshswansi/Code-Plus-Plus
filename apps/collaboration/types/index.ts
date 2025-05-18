import { IncomingMessage } from 'http';
import WebSocket from 'ws';

export type WSContext = {
    req: IncomingMessage;
    url: URL;
    token: string;
    userId?: string;
    whiteboardTabId: string;
    projectId: string,
  };

export type WSMiddleware = (
  ws: WebSocket,
  context: WSContext
) => Promise<boolean>; 