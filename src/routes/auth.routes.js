import express from "express";

import { register, me, refresh, logout } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { registerSchema } from "../validators/auth.validator.js";
import authenticate from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { uploadAvatar } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", authLimiter,validate(registerSchema), register);

router.post(
    "/login",authLimiter,
    validate(loginSchema),
    login
);
router.post("/refresh",authLimiter,refresh);
router.post("/logout",logout);
router.get("/me", authenticate, me);
//upload.single('avatar') tells Multer to look for a file attached to the field name "avatar"
router.patch("/avatar",authenticate,upload.single('avatar'),uploadAvatar);
export default router;