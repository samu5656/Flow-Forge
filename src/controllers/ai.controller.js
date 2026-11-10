import { chatWithProjectAIService } from "../services/ai.service.js";

export const chatWithProjectAI = async(req, res, next) => {
    try {
        const { organizationId, projectId } = req.params;
        const { message, history } = req.body;

        const result = await chatWithProjectAIService({
            message,
            history,
            projectId,
            organizationId
        });
        
        res.status(200).json({
            success: true,
            data: result
        });

    } catch(err) {
        next(err);
    }
};
