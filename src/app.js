import express from "express";
import cors from "cors";
import helmet from "helmet";
import organizationRoutes from "./routes/organizarion.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import issueRoutes from "./routes/issue.routes.js";
import taskRoutes from "./routes/task.routes.js";
import labelRoutes from "./routes/label.routes.js";
import cookieParser from "cookie-parser";
import milestoneRoutes from "./routes/milestone.routes.js";
import githubRoutes from "./routes/github.routes.js";
import redis from './config/redis.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({
    verify:(req,res,buf)=>{
        if(req.originalUrl.startsWith('/api/v1/github/webhook')){
            req.rawBody = buf.toString();
        }
    }
}));
app.use(cookieParser())

app.use("/api/v1/organizations",organizationRoutes);;
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", issueRoutes);
app.use("/api/v1", taskRoutes);
app.use("/api/v1", labelRoutes);
app.use("/api/v1", milestoneRoutes);
app.use("/api/v1", githubRoutes);

app.get("/health", async (req, res) => {
    try {
        await redis.ping();
        res.status(200).json({
            status: "ok",
            redis: "connected"
        });
    } catch (error) {
        res.status(200).json({
            status: "ok",
            redis: "disconnected"
        });
    }
});

app.use(errorMiddleware);
export default app;