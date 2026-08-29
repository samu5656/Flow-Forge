import express from "express";

import { register, me, refresh, logout } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { registerSchema } from "../validators/auth.validator.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post(
    "/login",
    validate(loginSchema),
    login
);
router.post("/refresh",refresh);
router.post("/logout",logout);
router.get("/me", authenticate, me);
export default router;