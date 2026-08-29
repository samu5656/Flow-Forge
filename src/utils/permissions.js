import { ROLE_PERMISSIONS } from "../constants/permissions.js";

export const hasPermission = (role,permission)=>{
    const permission = ROLE_PERMISSIONS[role] || [];

    return (permission.includes("*")||permission.includes(permission));
};