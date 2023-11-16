import express from 'express'
import {createServer} from 'http'
import {initIo} from "./socketServer.js";
import { LOCALLINK } from './public/constants.js';
import GameController from "./controller/gameController.js";
import UserService from "./service/userService.js";
const app = express();
const server = createServer(app);

//For local developpement
const io = initIo(server);

app.use(express.static('/public'));

io.on('connection', (socket, idUser) => {

  const user = UserService.authenticate(idUser);

  // Controller Initialization
  GameController.init(socket, user);

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
