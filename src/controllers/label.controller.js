import {
    createLabelService,
    getLabelsService,
    getLabelService,
    updateLabelService,
    deleteLabelService
} from "../services/label.service.js";

export const createLabel = async (req, res, next) => {
    try {
        const label = await createLabelService(
            req.body,
            req.params.projectId
        );

        res.status(201).json({
            success: true,
            data: label
        });
    } catch (error) {
        next(error);
    }
};

export const getLabels = async (req, res, next) => {
    try {
        const labels = await getLabelsService(
            req.params.projectId
        );

        res.status(200).json({
            success: true,
            data: labels
        });
    } catch (error) {
        next(error);
    }
};

export const getLabel = async (req, res, next) => {
    try {
        const label = await getLabelService(
            req.params.labelId,
            req.params.projectId
        );

        if (!label) {
            return res.status(404).json({
                success: false,
                message: "Label not found"
            });
        }

        res.status(200).json({
            success: true,
            data: label
        });
    } catch (error) {
        next(error);
    }
};

export const updateLabel = async (req, res, next) => {
    try {
        const label = await updateLabelService(
            req.params.labelId,
            req.params.projectId,
            req.body
        );

        if (!label) {
            return res.status(404).json({
                success: false,
                message: "Label not found"
            });
        }

        res.status(200).json({
            success: true,
            data: label
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLabel = async (req, res, next) => {
    try {
        const deleted = await deleteLabelService(
            req.params.labelId,
            req.params.projectId
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Label not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};