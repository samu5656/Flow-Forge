import prisma from "../lib/prisma.js"

export const createTeam = async (data)=>{
    return prisma.team.create({
        data
    });
};

export const findTeamsByOrganization = async(organizationId)=>{
    return prisma.team.findMany({
        where:{
            organizationId
        },
        orderBy:{
            createdAt: "desc"
        }
    });
};
//enforcing tenant scope at the query level- querying team needs both teamid and orgid because if a malicious user who belongs to orgA gets the ID of a team of organization B then without checking which org he belongs the team data will be displayed so it is important to check both team and org id during querying.
export const findTeamById = async(teamId,organizationId)=>{
    return prisma.team.findFirst({
        where:{
            id:teamId,
            organizationId
        }
    })
}