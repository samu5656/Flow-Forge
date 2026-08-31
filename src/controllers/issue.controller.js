import {
    createIssueService,
    findIssuesByProjectService,
    findIssueByIdService,
    updateIssueService,
    deleteIssueService
} from "../services/issue.service.js";

export const createIssue = async (req, res, next) => {
    try {
        const issue = await createIssueService(
            req.body,
            req.params.projectId
        );

        res.status(201).json({
            success: true,
            data: issue
        });
    } catch (error) {
        next(error);
    }
};

export const getIssuesByProject = async (req, res, next) => {
    try {
        const issues = await findIssuesByProjectService(
            req.params.issueId,
            req.params.projectId
        );

        res.status(200).json({
            success: true,
            data: issues
        });
    } catch (error) {
        next(error);
    }
};

export const getIssueById = async (req, res, next) => {
    try {
        const issue = await findIssueByIdService(
            req.params.issueId,
            req.params.projectId
        );

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: issue
        });
    } catch (error) {
        next(error);
    }
};

export const updateIssue = async (req, res, next) => {
    try {
        const updatedIssue = await updateIssueService(
            req.params.issueId,
            req.params.projectId,
            req.body
        );

        if (!updatedIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found or unauthorized to update"
            });
        }

        res.status(200).json({
            success: true,
            data: updatedIssue
        });
    } catch (error) {
        next(error);
    }
};

export const deleteIssue = async (req, res, next) => {
    try {
        const deletedIssue = await deleteIssueService(
            req.params.issueId,
            req.params.projectId
        );

        if (!deletedIssue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found or unauthorized to delete"
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
            data: deletedIssue
        });
    } catch (error) {
        next(error);
    }
};