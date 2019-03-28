
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicFolderPath = path.join(__dirname, '../public');

app.use(express.static(publicFolderPath));

io.on('connection', (socket) => {
    console.log('new socketio connection');
    
    socket.broadcast.emit('notification', 'new user joined in');

    socket.on('clientSentMsg', (input, callback) => {
        const filter = new Filter();
        if(filter.isProfane(input)) {
            return callback('No profanity allowed');
        }
        io.emit('serverSentMsg', input);
    });

    socket.on('disconnect', () => {
        io.emit('notification', 'a user has left');
    });

    socket.on('shareUserLocation', (coords, callback) => {
        socket.broadcast.emit('notification', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
        callback('received the coords, location shared');
    });
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});

