import prisma from "../lib/prisma.js";

export const createOrganization = async (data) => {
    return prisma.organization.create({
        data
    });
};