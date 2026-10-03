import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest:3,
    //when redis is down dont crash the app just skip cache
    lazyConnect:false
});

redis.on('connect',()=>{
    console.log("Redis Connected");
});

redis.on('error',(err)=>{
    console.log("Redis error: ",err.message);
});

export default redis;