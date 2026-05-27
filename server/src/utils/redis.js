// src/utils/redis.js
import { createClient } from "redis"
import logger from "./logger.js"

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:3000"
})

redisClient.on("error", (err) => logger.error("Redis error:", err))
redisClient.on("connect", () => logger.info("Redis connected"))

await redisClient.connect()

export default redisClient