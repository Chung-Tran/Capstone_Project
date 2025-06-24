const express = require("express");
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const routes = require('./routes/index');
const SocketHandler = require("./socket/socketHandler");
const startCronJobs = require("./cron");
dotenv.config();
// Tạo server http
const server = http.createServer(app);

cloudinary.config({
    secure: true
});

// Connect db
dbConnect();

const socketHandler = new SocketHandler(server);

app.locals.socketHandler = socketHandler;

// Config server
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const corsOptions = {
    origin: [
        'http://localhost:3000',
    ],
    credentials: true,
    exposedHeaders: ['x-new-access-token', 'x-token-resetpassword'],
};

app.use(cors(corsOptions));

//Use routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

startCronJobs();

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server start in PORT ${PORT}`);
});