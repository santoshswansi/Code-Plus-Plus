import { createLogger, format, transports } from "winston";
import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const isProduction = (process.env.NODE_ENV === "production");

const logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),  // allows string interpolation 
    format.json()
);

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, stack }) => {
        return stack
            ? `[${timestamp}] ${level}: ${message} \nStack: ${stack}`
            : `[${timestamp}] ${level}: ${message}`;
    })
);

const logger = createLogger({
    level: "info", 
    format: logFormat,
    transports: [
        new transports.File({ filename: path.join("logs", "error.log"), level: "error" }),
        new transports.File({ filename: path.join("logs", "combined.log") }),
    ],
});

if(!isProduction) {
    logger.add(new transports.Console({ format: consoleFormat }));
}

export {logger};