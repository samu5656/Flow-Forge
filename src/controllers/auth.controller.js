import { success } from "zod";
import { getCurrentUser, loginUser, refreshAccessToken, registerUser } from "../services/auth.services.js";
import AppError from "../utils/AppError.js";

export const register = async (req,res,next)=>{
    try{
        const user = await registerUser(req.body);
        res.status(201).json({
            success:true,
            data:user
        })
    }catch(error){
        next(error);
    }
}

export const login = async(req,res,next)=>{
    try{
        const result = await loginUser(req.body);

        res.cookie("refreshToken",result.refreshToken,{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
            sameSite:"lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            success:true,
                        data: {
                user: result.user,
                accessToken: result.accessToken
            }
        })
    }catch (error) {
        next(error);
    }
}
export const me = async (req,res,next)=>{
    try{
        const user = await getCurrentUser(req.user.id);

        res.status(200).json({
            success:true,
            data:user
        });
    }catch(error){
        next(error);
    }
}

export const refresh = async(res,req,next)=>{
    try{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            throw new AppError("Refresh token missing",401);
        }
        const accessToken = await refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            data:{
                accessToken
            }
        });
    }catch(err){
        next(err);
    }
}

export const logout = async(req,res,next)=>{
    try{
        res.clearCookie("refreshToken",{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:"lax"
        });
        res.status(204).send();
    }catch(err){
        next(err);
    }
};