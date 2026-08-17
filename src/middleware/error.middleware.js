// const errorMiddleware = (err,req,res,next)=>{
//     console.log(err);
//     const statusCode = err.statusCode || 500;
    
//     res.status(statusCode).json({
//         success: false,
//         message :err.message || "Internal server error"
//     });
// };

// export default errorMiddleware;

// src/middlewares/errorHandler.js
export const errorMiddleware = (err, req, res, next) => {
  // Log full error internally for developers
  console.error("LOGGED ERROR:", err);

  // If it's a known operational error, use its status code and message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  }

  // Handle Prisma Database Errors specifically
  if (err.code === "P2002") {
    return res.status(409).json({
      status: "fail",
      message: "A record with that unique field already exists.",
    });
  }

  // Fallback for unhandled programming/system errors
  return res.status(500).json({
    status: "error",
    message: "Something went wrong on the server.",
  });
};