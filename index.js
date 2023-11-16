import express from 'express'
import {Server} from 'socket.io'
import {createServer} from 'http'
import GameManager from "./service/gameManager.js";
import {initIo} from "./socketServer.js";
import { LOCALLINK } from './public/constants.js';
const app = express();
const server = createServer(app);
const gameManager = new GameManager();

//For local developpement
const io = initIo(server);

app.use(express.static('/public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join',(room) => {
    socket.join(room);
    console.log("User " + room+ " is listening for message")
  })

  socket.on('sendMessage', (data) => {
    io.to(data.receiver).emit('receiveMessage', data.message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');

    gameManager.checkPlayerDisconnected(socket.id);

  });

});

server.listen(3100, () => {
  console.log('Server is running on ' + LOCALLINK);
});
