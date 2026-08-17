import app from "./app.js";
import env from "./config/env.js";

app.listen(env.port, ()=>{
    console.log(`FlowForge API is running on port ${env.port}`);
});