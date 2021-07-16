
//Dependencies
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const path = require('path');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('../utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../utils/users');

//Intanstiate app
const app = express();
const server = http.createServer(app);
const io = socket(server);

//use public
app.use(express.static(path.join(__dirname, '../public')));

//set views
app.set('view engine', 'ejs');
app.set('views', 'views');

//use views
app.get('/', (req, res, next) =>{
    res.render('index');
    next();
})

app.get('/chat', (req, res, next) =>{
    res.render('chat');
})


io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {

        const {error, user} = addUser({ id: socket.id , username, room });

        if(error){
            return callback(error);
        }

        socket.join(room);

        //socket.emit socket.broadcast.emit io.emit
        //socket.to.emit socket.broadcast.to.emit io.to.emit
        socket.emit('message', generateMessage('Welcom!', 'Admin'));
        socket.broadcast.to(room).emit('message', generateMessage(`${user.username} has joined`, 'Admin'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('sendMessage', (mess, callback) => {
        const filter = new Filter();
        if(filter.isProfane(mess)){
            return callback('Profanity is not allowed');
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(mess, user.username));
        callback();
    })

    socket.on('sendLocation', (location, callback) => {
        const url = `https://www.google.com/maps?q=${location.lat},${location.long}`;
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocation(url, user.username));
        callback();
    })

    socket.on('disconnect', () => {
        const { error, user } = removeUser(socket.id);
        if(!error){
            io.to(user.room).emit('message', generateMessage(`${ user.username } has left room`, 'Admin'));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

//listen server on port
server.listen(8080, () => {
    console.log('Listening on port ' + 8080);
})