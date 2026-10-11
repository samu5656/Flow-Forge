// const errorMiddleware = (err,req,res,next)=>{
//     console.log(err);
//     const statusCode = err.statusCode || 500;
    
//     res.status(statusCode).json({
//         success: false,
//         message :err.message || "Internal server error"
//     });
// };

// export default errorMiddleware;
import { Prisma } from "@prisma/client";
import { success } from "zod";
import logger from "../config/logger.js";

const errorMiddleware = (err,req,res,next)=>{
  logger.error(err.message,{
    correlationId : req.correlationId,
    stack:err.stack,
    statusCode:err.statusCode || 500
  })

  if(err instanceof Prisma.PrismaClientKnownRequestError){
    if(err.code==='P2002'){
      return res.status(409).json({
        success:false,
        message:"A resource with this value already exists"
      });
    }

    if(err.code === "P2025"){
      return res.status(404).json({
        success:false,
        message:"Resource not found"
      });
    }
  }
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: 
    statusCode === 500?"Internal server error": err.message
  })
}

export default errorMiddleware;