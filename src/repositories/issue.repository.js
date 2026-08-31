export const createIssue = async(data)=>{
    return prisma.issue.create({
        data
    });
};

export const findIssuesByProject = async (
    projectId
) => {
    return prisma.issue.findMany({
        where: {
            projectId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findIssueById = async (
    issueId,
    projectId
) => {
    return prisma.issue.findFirst({
        where: {
            id: issueId,
            projectId
        }
    });
};

export const updateIssue = async(issueId,projectId,data)=>{
    return prisma.project.updateMany({
        where:{
            id:issueId,
            projectId
        },
        data
    });
};

export const deleteIssue = async(issueId,projectId)=>{
    return prisma.project.deleteMany({
        where:{
            id:issueId,
            projectId
        }
    });
};