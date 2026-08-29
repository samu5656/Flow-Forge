import express from "express";
import { createOrganization, deleteOrganizationController, getOgranization, getOgranizations, updateOrganizationController } from "../controllers/organization.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createOrganizationSchema, updateOrganizationSchema } from "../validators/organization.validator.js";
const router = express.Router();

router.post("/",authenticate,validate(createOrganizationSchema) ,createOrganization);
router.get("/:id",getOgranization);
router.patch("/:id",validate(updateOrganizationSchema),updateOrganizationController);
router.delete("/:id",deleteOrganizationController);
router.get("/",getOgranizations);
export default router;