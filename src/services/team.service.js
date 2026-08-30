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