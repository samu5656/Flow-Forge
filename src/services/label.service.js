import {
    createLabel,
    findLabelsByProject,
    findLabelById,
    updateLabel,
    deleteLabel
} from "../repositories/label.repository.js";

export const createLabelService = async (
    data,
    projectId
) => {
    return createLabel({
        ...data,
        projectId
    });
};

export const getLabelsService = async (
    projectId
) => {
    return findLabelsByProject(projectId);
};

export const getLabelService = async (
    labelId,
    projectId
) => {
    return findLabelById(
        labelId,
        projectId
    );
};

export const updateLabelService = async (
    labelId,
    projectId,
    data
) => {
    const label = await findLabelById(
        labelId,
        projectId
    );

    if (!label) {
        return null;
    }

    const result = await updateLabel(
        labelId,
        projectId,
        data
    );

    if (result.count === 0) {
        return null;
    }

    return findLabelById(
        labelId,
        projectId
    );
};

export const deleteLabelService = async (
    labelId,
    projectId
) => {
    const label = await findLabelById(
        labelId,
        projectId
    );

    if (!label) {
        return false;
    }

    const result = await deleteLabel(
        labelId,
        projectId
    );

    return result.count > 0;
};