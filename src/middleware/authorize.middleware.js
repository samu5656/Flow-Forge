import AppError from "../utils/AppError.js";
import { hasPermission } from "../utils/permissions.js";

const authorize = (permission) => {
    return async (req, res, next) => {
        try {
            const membership = req.organizationMembership;
            if (!membership) {
                throw new AppError("Ogranization Membership required", 403);
            }

            const allowed = hasPermission(membership.role, permission);

            if (!allowed) {
                throw new AppError(
                    "Insufficient permissions",
                    403
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    }
}

export default authorize;