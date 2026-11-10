import prisma from "../lib/prisma.js";

export const createTeam = async (data) => {
    return prisma.team.create({
        data
    });
};

export const findTeamsByOrganization = async (organizationId) => {
    return prisma.team.findMany({
        where: {
            organizationId
        },
        include: {
            TeamMember: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const findTeamById = async (teamId, organizationId) => {
    return prisma.team.findFirst({
        where: {
            id: teamId,
            organizationId
        },
        include: {
            TeamMember: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true
                        }
                    }
                }
            }
        }
    });
};

export const updateTeam = async (
    teamId,
    organizationId,
    data
) => {
    return prisma.team.updateMany({
        where: {
            id: teamId,
            organizationId
        },
        data
    });
};

export const deleteTeam = async (
    teamId,
    organizationId
) => {
    return prisma.team.deleteMany({
        where: {
            id: teamId,
            organizationId
        }
    });
};

export const addMemberToTeam = async (teamId, userId) => {
    return prisma.teamMember.create({
        data: {
            teamId,
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            }
        }
    });
};

export const removeMemberFromTeam = async (teamId, userId) => {
    return prisma.teamMember.deleteMany({
        where: {
            teamId,
            userId
        }
    });
};

export const findOrganizationMembers = async (organizationId) => {
    return prisma.organizationMember.findMany({
        where: {
            organizationId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    });
};
