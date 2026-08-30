import { createProjectService,getProjectService,getProjectsService } from "../services/project.sevice.js";
export const createProject = async (req, res, next) => {
    try {
        const project = await createProjectService(
            req.body,
            req.params.organizationId
        );

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const getProjects = async (req, res, next) => {
    try {
        const projects = await getProjectsService(
            req.params.organizationId
        );

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

export const getProject = async (req, res, next) => {
    try {
        const project = await getProjectService(
            req.params.projectId,
            req.params.organizationId
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};