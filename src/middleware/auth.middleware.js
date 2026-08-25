import jwt from "jsonwebtoken";
import authConfig from "../config/auth.js";
import AppError from "../utils/AppError.js";

const authenticate = (req,res,next)=>{
    try{
        const authorization = req.headers.authorization;

        if(!authorization){
            throw new AppError("Authentication Required",401);
        }
        const [scheme,token]=authorization.split(" ");

        if(scheme!=="Bearer" || !token){
            throw new AppError("Invalid authorization header",409);
        }

        const payload = jwt.verify(token,authConfig.accessTokenSecret);

        if(payload.type!=="access"){
            throw new AppError("Invalid access token",401);
        }

        req.user = {
            id:payload.sub
        }
        next();
    }
    catch(err){
        if(err.name==="TokenExpiredError"){
            return next(
                new AppError("Access token expired",401)
            );
        }
        if(err.name === "JsonWebTokenError"){
            return next(
                new AppError("Invalid access token",401)
            )
        }

        next(err);
    }
}

export default authenticate;