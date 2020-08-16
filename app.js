const express = require('express');
const path = require('path');
const http = require('http');
const Socketio = require('socket.io')
const formatMessage=require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,getRoomUser}=require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = Socketio(server)

// static folder
app.use(express.static(path.join(__dirname, 'public')))
const botName='ChatCord Bot';
 
// run when client is connect
    io.on('connection', socket => {
    socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room)
    socket.join(user.room)

     // welcome current user
    socket.emit('message',formatMessage(botName,'welcome to chatcard'))
    // brodcast when  user connet
    socket.broadcast
    .to(user.room)
    .emit(
    'message',
    formatMessage(botName,`${user.username} joined the chat` ))

    // send user and room info
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUser(user.room)
    })
    })
 
    // listen for chatMessage
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id)
        io
        .to(user.room)
        .emit('message',formatMessage(user.username,msg))
        
    })
        // run when client has disconnect
        socket.on('disconnect',()=>{
            const user=userLeave(socket.id);
            if(user){
            io.to(user.room)
            .emit('message',formatMessage(botName,`${user.username} has left the chat`))

             // send user and room info
          io.to(user.room).emit('roomUsers',{
           room:user.room,
        users:getRoomUser(user.room)
    })
            }
        })
})


const port = 3000 || process.env.PORT
server.listen(port, () => console.log('sever is running', port));







