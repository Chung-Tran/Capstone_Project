const express = require("express");
const app = express();
const http = require('http');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const cloudinary = require('cloudinary').v2;
const socketIo = require('socket.io');

// Tạo server http
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3030", process.env.REACT_APP_CLIENT_URL],
        methods: ["GET", "POST"],
        credentials: true
    }
});
// initializeSocket(io);


cloudinary.config({
    secure: true
});

// Connect db
// dbConnect();

// Config server
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const corsOptions = {
    origin: [
        process.env.REACT_APP_CLIENT_URL,
        process.env.REACT_APP_ADMIN_URL,
        'http://localhost:3000',
    ],
    credentials: true,
    exposedHeaders: ['x-new-access-token', 'x-token-resetpassword'],
};

app.use(cors(corsOptions));

//Use routes
// app.use('/api/auth', authRoute);

// Error handling middleware
// app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server start in PORT ${PORT}`);
});