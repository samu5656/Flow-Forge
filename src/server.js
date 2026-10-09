import { createServer } from "http";
import app from "./app.js";
import env from "./config/env.js";
import { initSocket } from "./socket.js";

//create http server using express
const httpServer = createServer(app);

//attach socket.io to that server
initSocket(httpServer);

//use httpserver.listen() instead of app.listen()
httpServer.listen(env.port, ()=>{
    console.log(`FlowForge API is running on port ${env.port}`);
});