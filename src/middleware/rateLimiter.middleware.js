import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";

const createLimiter = ({ windowMs, max, message }) => {
    return rateLimit({
        windowMs, //time window(15mins)
        max,//max requests allowed per window per IP
        standardHeaders: true, // Return standard `RateLimit-*` headers
        legacyHeaders: false, // Disable deprecated `X-RateLimit-*` headers

        //connect directly to redis container
        store: new RedisStore({
            // Send the raw Redis commands through our ioredis connection
            sendCommand: (...args) => redis.call(...args),
        }),

        handler: (req,res)=>{
            res.status(429).json({
                success:false,
                statusCode:429,
                message: message || "Too many requests please try again later."
            })
        }

    })
}

// 1. General API Limiter: 100 requests per 15 minutes
export const apiLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
});
// 2. Strict Auth Limiter: Max 5 attempts per 15 minutes (protects login/register)
export const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts. Your IP has been temporarily blocked for 15 minutes.'
});