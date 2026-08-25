import jwt from "jsonwebtoken";
import authConfig from "../config/auth.js";

export const generateAccessToken = (user)=>{
    return jwt.sign({
        //sub means subject of token- later decoded.sub gives user id
        sub:user.id,
        type:"access"
    },
    authConfig.accessTokenSecret,
    {
        expiresIn: authConfig.accessTokenExpiresIn
    });
};

export const generateRefreshToken = (user)=>{
    jwt.sign({
        sub:user.id,
        type:"refresh"
    },
    authConfig.refreshTokenSecret,
    {
        expiresIn: authConfig.refreshTokenExpiresIn
    }
)
}