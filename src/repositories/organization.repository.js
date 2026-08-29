import prisma from "../lib/prisma.js";

export const createOrganization = async (data,userId) => {
    return prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
            }
        });

        const membership = await tx.organizationMember.create({
            data: {
                userId,
                organizationId: organization.id,
                role: "ADMIN",
            },
            include:{
                user:{
                    select:{
                        id:true,
                        email:true
                    }
                }
            }
        });
        return {organization,membership};
    });
};

export const findOrganizationById = async (id) => {
    return prisma.organization.findUnique({
        where: {
            id
        }
    })
};

export const updateOrganization = async (id, data) => {
    return prisma.organization.update({
        where: {
            id
        },
        data
    });
}

export const deleteOrganization = async (id) => {
    return prisma.organization.delete({
        where: {
            id
        }
    });
};

export const findOrganizations = async ({ skip, take }) => {
    return prisma.organization.findMany({
        skip,
        take,
        orderBy: {
            createdAt: "desc"
        }
    });
}