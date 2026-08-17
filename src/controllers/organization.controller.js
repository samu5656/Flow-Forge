import { createOrganizationService } from "../services/organization.service.js";

export const createOrganization = async (req,res,next)=>{
    try{
        const organization = await createOrganizationService(req.body);

        res.status(201).json({
            success: true,
            data: organization
        });
    }catch(error){
        next(error);
    }
}
