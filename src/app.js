
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/message');
const {generateLocationMessage} = require('./utils/message');
const {addUser, getUser, getUsersInRoom, removeUser} =  require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicFolderPath = path.join(__dirname, '../public');

app.use(express.static(publicFolderPath));

io.on('connection', (socket) => {
    console.log('new socketio connection');
    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room});
        console.log('addUser = ', user);
        if(error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('serverSentMsg', generateMessage('Admin', `welcome ${user.username}`));
        socket.broadcast.to(user.room).emit('serverSentMsg', generateMessage('Admin', `${user.username} has joined!.`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('clientSentMsg', (input, callback) => {
        const user = getUser(socket.id);
        console.log('getUser(id) = ', user);
        const filter = new Filter();
        if(filter.isProfane(input)) {
            return callback(generateMessage(user.username, 'No profanity allowed'));
        }
        io.to(user.room).emit('serverSentMsg', generateMessage(user.username, input)); //specify room here
    });

    socket.on('shareUserLocation', (coords, callback) => {
        const user = getUser(socket.id);
        console.log('getUser(id) = ', user);
        socket.broadcast.to(user.room).emit('serverSentMsgLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)); //specify room here  
        callback('received the coords, location shared with every other user present in this chat room');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('removeUser = ',user);
        if(user) {
            io.to(user.room).emit('serverSentMsg', generateMessage('Admin', `${user.username} has left`)); //specify room here
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});
