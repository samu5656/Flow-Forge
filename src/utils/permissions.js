import { ROLE_PERMISSIONS } from "../constants/permissions.js";

export const hasPermission = (role,permission)=>{
    const permissions = ROLE_PERMISSIONS[role] || [];

    return (permissions.includes("*")||permissions.includes(permission));
};