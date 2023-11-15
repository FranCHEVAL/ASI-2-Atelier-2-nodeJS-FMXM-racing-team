import socketIO from 'socket.io';
import { Server } from "socket.io";

let io;

export const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000"
        }
    });
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};