import winston from "winston";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

// Define un formato de log personalizado
const logFormat = winston.format.printf(
  ({ level, message, timestamp, context }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${context ? JSON.stringify(context) : ""}`;
  }
);

export class WinstonLoggerProvider implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat // Usa el formato personalizado
      ),
      transports: [
        new winston.transports.Console(),
        process.env.NEXT_ENVIRONMENT === "development"
          ? new winston.transports.File({ filename: "logs/app.log" })
          : undefined,
      ],
    });
  }

  info(message: string, context?: any) {
    // Pasa arch_level como metadata en el objeto de log
    this.logger.log({
      level: "info",
      message,
      context,
    });
  }

  warn(message: string, context?: any) {
    this.logger.log({
      level: "warn",
      message,
      context,
    });
  }

  error(message: string, context?: any) {
    this.logger.log({
      level: "error",
      message,
      context,
    });
  }
}
