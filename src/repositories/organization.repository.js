import prisma from "../lib/prisma.js";

export const createOrganization = async (data) => {
    return prisma.organization.create({
        data
    });
};

export const findOrganizationById = async(id)=>{
    return prisma.organization.findUnique({
        where:{
            id
        }
    })
};

export const updateOrganization = async(id,data)=>{
    return prisma.organization.update({
        where:{
            id
        },
        data
    });
}

export const deleteOrganization = async(id)=>{
    return prisma.organization.delete({
        where:{
            id
        }
    });
};

export const findOrganizations = async({skip,take})=>{
    return prisma.organization.findMany({
        skip,
        take,
        orderBy:{
            createdAt:"desc"
        }
    });
}