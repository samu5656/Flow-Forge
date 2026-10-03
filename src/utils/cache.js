import redis from "../config/redis.js";

const DEFAULT_TTL = 60;

/**
 * Get a value from cache.
 * Returns parsed JSON or null if not found / Redis is down.
 */
export const getCache = async(key)=>{
    try{
        const cached = await redis.get(key);
        if(!cached) return null;
        return JSON.parse(cached);
    }catch(err){
        console.log("Cache GET error:",err.message);
        return null;
    }
};

/**
 * Set a value in cache with a TTL.
 * Silently fails if Redis is down — caching should never break the app.
 */
export const setCache = async (key,data,ttl=DEFAULT_TTL)=>{
    try{
        await redis.set(key,JSON.stringify(data),'EX',ttl);
    }catch(err){
        console.log("Cache SET error:",error.message);
    }
};

export const deleteCache = async(key)=>{
    try{
        await redis.del(key);
    }catch(err){
        console.err('Cache DEL error:',err.message);
    }
}

/**
 * Delete all keys matching a pattern.
 * Example: deletePattern('projects:*') removes all cached projects.
 * 
 * WHY: When a project is updated, we need to invalidate not just
 * the single project cache, but also the project-list cache.
 */
export const deleteCacheByPattern = async (pattern)=>{
    try{
        const keys = await redis.keys(pattern);

        if(keys.length>0){
            await redis.del(...keys);
        }
    }catch(err){
        console.log("Cache PATTERN DEL error:",err.message);
    }
}