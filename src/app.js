import express from "express";
import cors from "cors";
import helmet from "helmet";
import organizationRoutes from "./routes/organizarion.routes.js"
import errorMiddleware from "./middleware/error.middleware.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health",(req,res)=>{
    res.status(200).json({
        status: "ok"
    });
});

app.use("/api/v1/organizations",organizationRoutes);;


app.use(errorMiddleware);
export default app;