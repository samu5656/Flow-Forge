import { success } from "zod";
import { createOrganizationService,deleteOrganizationService,getOrganizationService, updateOrganizationService,getOrganizationsService } from "../services/organization.service.js";

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

export const getOgranization = async(req,res,next)=>{
    try{
        const organization = await getOrganizationService(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: organization
        })
    }catch(err){
        next(err);
    }
}

export const updateOrganizationController = async(req,res,next) =>{
    try{
        const organization = await updateOrganizationService(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success:true,
            data:organization
        });
    }catch(error){
        next(error);
    }
}

export const deleteOrganizationController =async(req,res,next)=>{
    try{
        await deleteOrganizationService(req.params.id);
        res.status(204).send();
    }catch(err){
        console.log(err);
    }
}

export const getOgranizations = async(req,res,next)=>{
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const limt = Number(req)
        const organizations = await getOrganizationsService({
            page,
            limit
        });

        res.status(200).json({
            success:true,
            data: organizations
        });
    }catch(err){
        console.log(err);
    }
}