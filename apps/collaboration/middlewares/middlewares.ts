import jwt, { Secret } from 'jsonwebtoken';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { WSContext } from '../types/index.ts';
import { POLICY_VIOLATED } from '../constants/index.ts';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = async (
  ws: WebSocket,
  context: WSContext
): Promise<boolean> => {
  const { token } = context;
  if(!token){
    ws.close(POLICY_VIOLATED, 'Unauthorized');
    return false;
  }

  try{
    const decoded: any = jwt.verify(token, JWT_SECRET as Secret);
    context.userId = decoded.userId;
    return true;
  }catch(err){
    ws.close(POLICY_VIOLATED, 'Invalid token');
    return false;
  }
};

export const accessControlMiddleware = async (
    ws: WebSocket,
    context: WSContext
  ): Promise<boolean> => {
    const { userId, projectId } = context;
  
    const hasAccess = false;
    
    if(!hasAccess){
      ws.close(POLICY_VIOLATED, 'Access denied');
      return false;
    }
    
    return true;
  };
  
  
