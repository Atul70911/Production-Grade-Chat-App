// src/utils/logger.js
import winston from "winston"
import path from "path"

const { combine, timestamp, printf, colorize, errors } = winston.format

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
})

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Console
        new winston.transports.Console({
            format: combine(colorize(), logFormat)
        }),
        // Info logs file
        new winston.transports.File({
            filename: "logs/info.log",
            level: "info"
        }),
        // Error logs file
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        })
    ]
})

export default logger