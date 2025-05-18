import express from 'express';
import router from './routes/routes.ts';
import { config } from './config/config.ts';
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

app.use(cors({
  origin: process.env.FRONTEND_BASE_URL, 
  credentials: true,
}));

app.use('/', router);

app.listen(config.port, () => {
  console.log(`API Gateway running at ${config.port}`);
});
