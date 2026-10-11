import winston from "winston";

const {combine,timestamp,printf,colorize,json,errors}=winston.format;

//local development human readable with colors
const devFormat = printf(({level,message,timestamp,stack,correlationId})=>{
    const idPrefix = correlationId? `[${correlationId}]`:'';
    return `${timestamp} ${level}: ${idPrefix}${stack || message}`;
})

const isProduction = process.env.NODE_ENV === "production";

//create winston logger instance
//In production, you set LOG_LEVEL=info (silencing all verbose debug clutter).
const logger = winston.createLogger({
    level:process.env.LOG_LEVEL || (isProduction?'info':'debug'),
    format:combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        errors({stack:true}) //automatically capture full error stack traces
    ),
    transports:[
        new winston.transports.Console({
            format:isProduction? json() : combine(colorize(),devFormat)
        })
    ]
});

export default logger;