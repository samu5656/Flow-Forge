import prisma from "../lib/prisma.js";

export const createRefreshToken = async(data)=>{
    return prisma.refreshToken.create({
        data
    })
}

export const findRefreshToken = async (tokenHash) =>{
    return prisma.refreshToken.findUnique({
        where:{
            tokenHash
        },
        include:{
            user:true
        }
    })
};

export const revokeRefreshToken = async(id)=>{
    return prisma.refreshToken.update({
        where:{
            id
        },
        data:{
            revokedAt: new Date()
        }
    })
}