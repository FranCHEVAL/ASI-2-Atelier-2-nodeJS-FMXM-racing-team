import { Server } from "socket.io";

let io;

export const initIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Autoriser toutes les origines
        }
    });
    console.log('Socket.io initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};