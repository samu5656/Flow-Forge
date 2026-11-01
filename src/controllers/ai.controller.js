import { chatWithProjectAIService } from "../services/ai.service.js";

export const chatWithProjectAI = async(req,resizeBy,next)=>{
    try{
        const {organizationId,projectId} =req.params;
        const {message,history}=req.body;

        const result = await chatWithProjectAIService({
            message,
            history,
            projectId,
            organizationId
        });
        
        resizeBy.status(200).json({
            success:true,
            data:result
        })

    }catch(err){
        next(err);
    }
}