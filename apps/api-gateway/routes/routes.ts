import { Router } from 'express';
import { authServiceProxy } from '../proxies/authServiceProxy.ts';
import { projectServiceProxy } from '../proxies/projectServiceProxy.ts';

const router = Router();

router.use("/auth", authServiceProxy);
router.use("/projects", projectServiceProxy);

export default router;