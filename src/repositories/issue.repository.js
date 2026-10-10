import prisma from "../lib/prisma.js";

export const createIssue = async (data) => {
    return prisma.issue.create({
        data
    });
};

export const findIssuesByProject = async (
    projectId,filters = {}
) => {

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1)*limit;

    const whereClause = {
        projectId: projectId,
    };

        // If the user asked for a specific status (e.g., ?status=OPEN)
    if(filters.status){
        whereClause.status = filters.status;
    }

    if(filters.search){
        whereClause.title = {
            contains: filters.search,
            mode: "insensitive"
        }
    }

        // 3. Run TWO queries in parallel (one for the data, one for the total count)
        const [issues,totalCount] = await Promise.all([
            prisma.issue.findMany({
                where: whereClause,
                skip:skip,
                take:limit,
                orderBy:{createdAt:"desc"}
            }),
            prisma.issue.count({where:whereClause})
        ])
    return {
        data:issues,
        meta:{
            total: totalCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalCount/limit)
        }
    }
};

export const findIssueById = async (
    issueId,
    projectId
) => {
    return prisma.issue.findFirst({
        where: {
            id: issueId,
            projectId,
            project: {
                organizationId
            }
        }
    });
};

export const updateIssue = async (issueId, projectId, data) => {
    return prisma.project.updateMany({
        where: {
            id: issueId,
            projectId,
            project: {
                organizationId
            }
        },
        data
    });
};

export const deleteIssue = async (issueId, projectId) => {
    return prisma.project.deleteMany({
        where: {
            id: issueId,
            projectId,
            project: {
                organizationId
            }
        }
    });
};