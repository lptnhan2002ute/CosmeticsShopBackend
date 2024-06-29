const express = require('express')
require('dotenv').config()

const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')

const cookieParser = require('cookie-parser')
const cors = require('cors')
const socketIo = require('socket.io');
const http = require('http')
const flashSaleScheduler = require('./tasks/flashSaleScheduler');
const orderScheduler = require('./tasks/orderScheduler');
const { verifySocketMiddleware } = require('./middlewares/verifySocket')


const app = express()
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
    credentials: true,

}))

flashSaleScheduler();
orderScheduler();
const port = process.env.PORT || 8181
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

dbConnect()
initRoutes(app)

app.use('/', (req, res) => { res.send('Server on') })


// Socket.io logic for chat
io.on('connection', (socket) => {
    io.use(verifySocketMiddleware);
    console.log('A user connected');

    // io.use(verifySocketMiddleware);

    // Join a conversation
    socket.on('joinRoom', ({ sessionId }) => {
        socket.join(sessionId);
        console.log(`A user joined room: ${sessionId}`);
    });

    // Leave a room
    socket.on('leaveRoom', ({ sessionId }) => {
        socket.leave(sessionId);
        console.log(`A user left room: ${sessionId}`);
    })

    // Listen for chatMessage
    socket.on('chatMessage', ({ sessionId, message }) => {
        socket.to(sessionId).emit('message', message);
    });

    socket.on('newSession', async (data) => {
        const User = require('./models/user');
        const ChatSession = require('./models/chatSession');

        const session = await ChatSession.findById(data._id).populate('customerUserID');
        const admins = await User.find({ role: 'Admin' });
        admins.forEach(admin => socket.to(admin._id.toString()).emit('newSession', session));
    })

    // Listen for closeSession
    socket.on('closeSession', ({ sessionId }) => {
        socket.to(sessionId).emit('closeSession', { sessionId });
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(port, () => {
    console.log('Server running on port: ' + port);
});