import prisma from "../lib/prisma.js";

export const findUserByEmail = async(email)=>{
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}

export const findUserById = async(id)=>{
    return prisma.user.findUnique({
        where:{
            id
        }
    });
};

export const createUser = async (data)=>{
    return prisma.user.create({
        data
    });
};