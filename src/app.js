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
import "./workers/webhook.worker.js";
import './workers/email.worker.js'; // This starts the worker!
import { addEmailJob } from './queues/email.queue.js';

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

app.post('/api/v1/test-email', async (req, res) => {
    const { email } = req.body;
    console.log(`[API] 1. Received request to send email to ${email}`);
    
    // Drop the job in the queue
    await addEmailJob({ to: email, subject: 'Welcome to FlowForge!' });
    
    console.log('[API] 2. Job added to queue. Responding to user immediately.');
    
    // Respond INSTANTLY. We do not wait for the 2-second timeout!
    res.status(200).json({ 
        message: 'Email queued successfully. You will receive it shortly!' 
    });
});

app.use(errorMiddleware);
export default app;