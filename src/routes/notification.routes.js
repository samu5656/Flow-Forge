import express from "express";
import {getNotifications,markAsRead} from "../controllers/notification.controller.js";
import authenticate from "../middleware/auth.middleware.js"
const router = express.Router();

router.use(authenticate);

router.get("/notifications",getNotifications);
router.post("/notifications/:id/read",markAsRead);

export default router;