import { createOrganization } from "../repositories/organization.repository.js";

export const createOrganizationService = async(data)=>{
    const organization = await createOrganization(data);

    return organization;
};