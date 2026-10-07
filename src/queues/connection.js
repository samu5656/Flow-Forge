import Redis from 'ioredis';
import env from '../config/env.js';

// BullMQ explicitly requires maxRetriesPerRequest to be null
export const connection = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest:null,
});