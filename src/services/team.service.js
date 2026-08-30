import { createTeam, findTeamById, findTeamsByOrganization } from "../repositories/team.repository.js";

export const createTeamService = async (data, organizationId) => {
    return createTeam({ ...data, organizationId });
}
export const getTeamsService = async (
    organizationId
) => {
    return findTeamsByOrganization(
        organizationId
    );
};

export const getTeamService = async (
    teamId,
    organizationId
) => {
    return findTeamById(
        teamId,
        organizationId
    );
};

export const updateTeamService = async (
    teamId,
    organizationId,
    data
) => {
    const existingTeam =
        await findTeamById(
            teamId,
            organizationId
        );

    if (!existingTeam) {
        return null;
    }

    await updateTeam(
        teamId,
        organizationId,
        data
    );

    return findTeamById(
        teamId,
        organizationId
    );
};

export const deleteTeamService = async (
    teamId,
    organizationId
) => {
    const existingTeam =
        await findTeamById(
            teamId,
            organizationId
        );

    if (!existingTeam) {
        return null;
    }

    await deleteTeam(
        teamId,
        organizationId
    );

    return existingTeam;
};