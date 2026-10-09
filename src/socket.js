import {Server} from "socket.io";

let io;

export const initSocket = (httpServer) =>{
    io = new Server(httpServer,{
        cors:{origin:'*'}
    });

    io.on("connection",(socket)=>{
        console.log(`Client connected: ${socket.id}`);

        socket.on("authenticate",(userId)=>{
            //Put this socket into a private "room" named after their User ID
            socket.join(userId);
            console.log(`Socket ${socket.id} authenticated as User: ${userId}`);
        });

        socket.on("disconnect",()=>{
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = ()=>{
    if(!io){
        throw new Error("Socket.io is not initialized!");
    }
    return io;
};