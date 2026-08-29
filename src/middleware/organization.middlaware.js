import prisma from "../lib/prisma.js"
import AppError from "../utils/AppError.js";

const requireOrganizationMembership = async (req, res, next) => {
    try {
        const organizationId = req.params.organizationId;

        if (!organizationId) {
            throw new AppError("Orgnization ID is required", 400);
        }
        const membership = await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: req.user.id,
                    organizationId
                }
            }
        });

        if (!membership) {
            throw new AppError(
                "Organization membership required",
                403
            );
        }

        req.organizationMembership = membership;
        next();

    } catch (err) {
        next(err);
    }
}

export default requireOrganizationMembership;