import { createOrganization, deleteOrganization, findOrganizationById, findOrganizations, updateOrganization } from "../repositories/organization.repository.js";
import AppError from "../utils/AppError.js";

export const createOrganizationService = async(data,userId)=>{
    const organization = await createOrganization(data,userId);

    return organization;
};

export const getOrganizationService = async (id)=>{
    const organization = await findOrganizationById(id);

    if(!organization){
        throw new AppError(
            "Organization not found",
            404
        );
    }

    return organization;
}

export const updateOrganizationService = async(id,data)=>{
    return updateOrganization(id,data);
}

export const deleteOrganizationService = async(id)=>{
    return deleteOrganization(id);
}

export const getOrganizationsService =async({page,limit})=>{

    const skip = (page-1)*limit;
    return findOrganizations({skip,take:limit});
}