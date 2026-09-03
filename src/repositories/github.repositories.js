import prisma from "../lib/prisma.js";

export const findGithubAccountByUserId = async(userId)=>{
    return prisma.githHubAccount.findUnique({
        where:{
            userId
        }
    });
};

export const findGithubAccountByGithubId = async(githubId)=>{
    return prisma.githHubAccount.findUnique({
        where:{
            githubId
        }
    });
};

export const createGithubAccount = async(data)=>{
    return prisma.githHubAccount.create({
        data
    })
}

export const updateGithubAccount = async(userId,data)=>{
    return prisma.githHubAccount.update({
        where:{
            userId
        },
        data
    });
};

export const deleteGithubAccount = async(userId)=>{
    return prisma.githHubAccount.delete({
        where:{
            userId
        }
    })
}

export const createProjectRepository = async(data)=>{
    return prisma.projectRepository.create({
        data
    })
}
//prevent cross tenant access
export const findProjectRepositories = async(projectId,organizationId)=>{
    return prisma.projectRepository.findMany({
        where:{
            projectId,
            project:{
                organizationId
            }
        },
        orderBy:{
            createdAt:"desc"
        }
    })
}

export const findProjectRepositoryById = async(repositoryId,projectId,organizationId)=>{
    return prisma.projectRepository.findFirst({
        where:{
            id:repositoryId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};

export const deleteProjectRepository = async(repositoryId,projectId,organizationId)=>{
    return prisma.projectRepository.deleteMany({
        where:{
            id:repositoryId,
            projectId,
            project:{
                organizationId
            }
        }
    });
};

