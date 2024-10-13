const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const {v4: createRoomID} = require('uuid');

const port = process.env.PORT || 4001;

const app = express();

app.use(cors());

app.get('/',(req,res) => {
    res.send('server is working');
});

const server = http.createServer(app);

const io = socketio(server);

const users = [{}];

//sockets
io.on('connection', (socket)=>{
  console.log('new connection');

  socket.on('join-room',({roomId, userId, name}) => {
    users[userId] = {name,roomId};
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('new-user',{name});
  });

  socket.on('send-element',({elements, roomId}) => {
    socket.broadcast.to(roomId).emit('recive-element',{elements});
  });

  socket.on('disconnect',() => {
    const user = users[socket.id];
    if(user){
      socket.broadcast.to(user.roomId).emit('leave',{name: user.name});
    }
    delete users[socket.id];
  });

});

server.listen(port,() => {
    console.log(`server is working on ${port}`);
});
