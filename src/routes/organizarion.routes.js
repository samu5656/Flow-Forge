import express from "express";
import { createOrganization } from "../controllers/organization.controller.js";
import validateOrganization from "../middleware/validateOrganization.js";

const router = express.Router();

router.post("/",validateOrganization ,createOrganization);

export default router;