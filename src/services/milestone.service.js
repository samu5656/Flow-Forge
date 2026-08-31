import {
    createMilestone,
    findMilestonesByProject,
    findMilestoneById,
    updateMilestone,
    deleteMilestone
} from "../repositories/milestone.repository.js";

export const createMilestoneService = async (
    data,
    projectId
) => {
    return createMilestone({
        ...data,
        projectId
    });
};

export const getMilestonesService = async (
    projectId
) => {
    return findMilestonesByProject(projectId);
};

export const getMilestoneService = async (
    milestoneId,
    projectId
) => {
    return findMilestoneById(
        milestoneId,
        projectId
    );
};

export const updateMilestoneService = async (
    milestoneId,
    projectId,
    data
) => {
    const milestone = await findMilestoneById(
        milestoneId,
        projectId
    );

    if (!milestone) {
        return null;
    }

    const result = await updateMilestone(
        milestoneId,
        projectId,
        data
    );

    if (result.count === 0) {
        return null;
    }

    return findMilestoneById(
        milestoneId,
        projectId
    );
};

export const deleteMilestoneService = async (
    milestoneId,
    projectId
) => {
    const milestone = await findMilestoneById(
        milestoneId,
        projectId
    );

    if (!milestone) {
        return false;
    }

    const result = await deleteMilestone(
        milestoneId,
        projectId
    );

    return result.count > 0;
};