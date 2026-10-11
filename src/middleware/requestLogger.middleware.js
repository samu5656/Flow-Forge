import {v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

const requestLogger = (req,res,next)=>{

    const correlationId = req.headers["x-correlation-id"] || uuidv4();
    req.correlationId = correlationId;

    res.setHeader('X-Correlation-ID',correlationId);

    const startTime = Date.now();

    //listen for when express finishes sending the response
    res.on("finish",()=>{
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        const logData = {
            correlationId,
            method:req.method,
            url: req.originalUrl,
            status: statusCode,
            duration: `${duration}ms`
        }

        const message = `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`;

        if (statusCode >= 500) {
            logger.error(message, logData);
        } else if (statusCode >= 400) {
            logger.warn(message, logData);
        } else {
            logger.info(message, logData);
        }

    });
    next();
}

export default requestLogger;