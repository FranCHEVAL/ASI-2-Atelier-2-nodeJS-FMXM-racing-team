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

const chatHistory = []

app.use(express.static('/public'));

io.on('connection', (socket, idUser) => {

  const user = UserService.authenticate(idUser);

  // Controller Initialization
  GameController.init(socket, user);

  socket.on('join',(roomPayload) => {
    socket.join(roomPayload.sender);
    console.log("User " + roomPayload.sender+ "is listening for new messages ")
    const chat = chatHistory.filter(
      x=>(x.sender==roomPayload.sender
      &&x.receiver==roomPayload.receiver)||
      (x.sender==roomPayload.receiver
        &&x.receiver==roomPayload.sender)
    )
    io.to(roomPayload.sender).emit('loadChatHistory', chat)
  })

  socket.on('sendMessage', (data) => {
    chatHistory.push(data)
    io.to(data.receiver).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');

    gameManager.checkPlayerDisconnected(socket.id);

  });

});

server.listen(3100, () => {
  console.log('Server is running on ' + LOCALLINK);
});
