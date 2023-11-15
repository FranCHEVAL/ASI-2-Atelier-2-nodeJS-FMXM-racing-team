import express from 'express'
import {Server} from 'socket.io'
import {createServer} from 'http'
import GameManager from "./service/gameManager.js";
import {initIo} from "./socketServer.js";
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
  });

  /** Action du jeu */

  socket.on('findGame', (playerId, name, deckIds, callback) => {
    gameManager.findGameOrCreate(playerId, name, deckIds).then((game) => {
      socket.join(game.id);
      io.to(game.id).emit('playerJoined', { playerId: playerId, playerName: game.players.find(player => player.id === playerId).name });
      callback({ status: 'ok', game: game });
    });
  });

  socket.on('playerAttack', (gameId, playerId, cardId, targetPlayerId, targetCardId, callback) => {
    try {
      gameManager.attack(gameId, playerId, cardId, targetCardId)
      callback({ status: 'ok' });
    } catch (e) {
      callback({ status: 'error', message: e.message });
    }
  });

  socket.on('endTurn', (gameId, playerId, callback) => {
    try {
      gameManager.endTurn(gameId, playerId)
      callback({status: 'ok'});
    } catch (e) {
      callback({status: 'error', message: e.message});
    }
  });

});

server.listen(3100, () => {
  console.log('Server is running on http://localhost:3100');
});
