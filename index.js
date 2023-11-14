import express from 'express'
import {Server} from 'socket.io'
import {createServer} from 'http'

const app = express();
const server = createServer(app);

//For local developpement
const io = new Server(server,{
  cors: {
    origin: "http://localhost:3000"
  }
})

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
});

server.listen(3100, () => {
  console.log('Server is running on http://localhost:3100');
});
