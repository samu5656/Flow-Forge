import { createServer } from "http";
import app from "./app.js";
import env from "./config/env.js";
import { initSocket } from "./socket.js";
import prisma from "./lib/prisma.js";
import redis from "./config/redis.js";
import logger from "./config/logger.js";


//create http server using express

const httpServer = createServer(app);

//attach socket.io to that server
initSocket(httpServer);

//use httpserver.listen() instead of app.listen()

//For gracefull shutdown
//Store reference to your running HTTP server
//const server = app.listen(PORT,...);

const server = httpServer.listen(env.port, ()=>{
    console.log(`FlowForge API is running on port ${env.port}`);
});


const shutdown = async(signal)=>{
    logger.info(`Received ${signal}.Starting graceful shutdown...`)

    //1.Stop accepting new connections
    server.close(async()=>{
        logger.info("HTTP server closed.")

        try{
            await redis.quit();
            logger.info("Redis connection closed")

            await prisma.$disconnect();
            logger.info("Database pool disconnected.")

            logger.info("Graceful shutdown completed successfully. Exiting.");
            process.exit(0);
        }catch(error){
            logger.error(`Error during graceful shutdown: ${error.message}`);
            process.exit(1);
        }
    });

    setTimeout(()=>{
        logger.error("Forecefully terminating process after timeout.");
        process.exit(1);
    },10000)
}

process.on("SIGTERM",()=>shutdown("SIGTERM"));
process.on("SIGINT",()=>shutdown("SIGINT"));


