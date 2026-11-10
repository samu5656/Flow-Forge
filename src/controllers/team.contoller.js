import { createTeamService, getTeamService, getTeamsService, updateTeamService, deleteTeamService } from "../services/team.service.js";
import { addMemberToTeam, removeMemberFromTeam, findOrganizationMembers } from "../repositories/team.repository.js";

export const createTeam = async (req, res, next) => {
    try {
        const team = await createTeamService(req.body, req.params.organizationId);
        res.status(201).json({
            success: true,
            data: team
        });
    } catch (err) {
        next(err);
    }
};

export const getTeams = async (req, res, next) => {
    try {
        const teams = await getTeamsService(req.params.organizationId);
        res.status(200).json({
            success: true,
            data: teams
        });
    } catch (err) {
        next(err);
    }
};

export const getTeam = async (req, res, next) => {
    try {
        const team = await getTeamService(
            req.params.teamId,
            req.params.organizationId
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

export const updateTeam = async (req, res, next) => {
    try {
        const team = await updateTeamService(
            req.params.teamId,
            req.params.organizationId,
            req.body
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTeam = async (req, res, next) => {
    try {
        const team = await deleteTeamService(
            req.params.teamId,
            req.params.organizationId
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Team deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const addTeamMember = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;
        const member = await addMemberToTeam(teamId, userId);
        res.status(201).json({
            success: true,
            data: member
        });
    } catch (error) {
        next(error);
    }
};

export const removeTeamMember = async (req, res, next) => {
    try {
        const { teamId, userId } = req.params;
        await removeMemberFromTeam(teamId, userId);
        res.status(200).json({
            success: true,
            message: "Member removed from team"
        });
    } catch (error) {
        next(error);
    }
};

export const getOrgMembers = async (req, res, next) => {
    try {
        const { organizationId } = req.params;
        const members = await findOrganizationMembers(organizationId);
        res.status(200).json({
            success: true,
            data: members
        });
    } catch (error) {
        next(error);
    }
};
