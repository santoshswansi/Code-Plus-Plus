import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 6000,
  authServiceUrl: process.env.AUTH_SERVICE_URL as string,
  projectServiceUrl: process.env.PROJECT_SERVICE_URL as string,
};
