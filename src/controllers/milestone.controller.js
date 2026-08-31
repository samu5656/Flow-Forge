import {
    createMilestoneService,
    getMilestonesService,
    getMilestoneService,
    updateMilestoneService,
    deleteMilestoneService
} from "../services/milestone.service.js";
import { createMilestoneSchema } from "../validators/milestone.validator.js";
export const createMilestone = async (
    req,
    res,
    next
) => {
    try {
        //Parse with Zod — dueDate becomes a Date object
        const parsed = createMilestoneSchema.parse(req.body);

        const milestone =
            await createMilestoneService(
                parsed,
                req.params.projectId
            );

        res.status(201).json({
            success: true,
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

export const getMilestones = async (
    req,
    res,
    next
) => {
    try {
        const milestones =
            await getMilestonesService(
                req.params.projectId
            );

        res.status(200).json({
            success: true,
            data: milestones
        });
    } catch (error) {
        next(error);
    }
};

export const getMilestone = async (
    req,
    res,
    next
) => {
    try {

        const milestone =
            await getMilestoneService(
                req.params.milestoneId,
                req.params.projectId
            );

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

export const updateMilestone = async (
    req,
    res,
    next
) => {
    try {
        const milestone =
            await updateMilestoneService(
                req.params.milestoneId,
                req.params.projectId,
                req.body
            );

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMilestone = async (
    req,
    res,
    next
) => {
    try {
        const deleted =
            await deleteMilestoneService(
                req.params.milestoneId,
                req.params.projectId
            );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};