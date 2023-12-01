import express from 'express'
import {createServer} from 'http'
import GameManager from "./service/gameManager.js";
import ChatController from './controller/chatController.js';
import {initIo} from "./socketServer.js";
import { LOCALLINK } from './public/constants.js';
import GameController from "./controller/gameController.js";
import UserService from "./service/userService.js";
import cors from 'cors';

const cors = require(cors);
const app = express();
const server = createServer(app);

//For local developpement
const io = initIo(server);

app.use(cors());
app.use(express.static('/public'));

io.on('connection', (socket) => {

  const userId = socket.handshake.query
  const user = UserService.authenticate(userId);

  // Controller Initialization
  GameController.init(socket, user);

  //Controller gestion du chat
  ChatController.init(socket, user);
 
  socket.on('disconnect', () => {
    console.log('A user disconnected');

    GameManager.checkPlayerDisconnected(socket.id);

  });

});

server.listen(3100, () => {
  console.log('Server is running on ' + LOCALLINK);
});
