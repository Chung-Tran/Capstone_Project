const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Messenger = require('../models/messenger.model');

class SocketHandler {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://160.250.133.57:3000",
                methods: ["GET", "POST"]
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.users = new Map(); // userId -> { socketId, role }
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.role = decoded.role;
                socket.username = decoded.username;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);
            this.users.set(socket.userId, {
                socketId: socket.id,
                role: socket.role
            });

            // Khách hoặc shop join vào room (theo conversation)
            socket.on('join_conversation', ({ conversationId }) => {
                const roomId = `conversation_${conversationId}`;
                socket.join(roomId);
                socket.currentRoom = roomId;
                console.log(`${socket.userId} joined room ${roomId}`);
            });

            // Gửi tin nhắn
            socket.on('send_message', async (data) => {
                const { conversationId, receiverId, content } = data;
                const roomId = `conversation_${conversationId}`;

                const messageData = {
                    conversation_id: conversationId,
                    sender_id: socket.userId,
                    receiver_id: receiverId,
                    content,
                    is_read: false,
                    created_at: new Date()
                };

                try {
                    // Lưu vào DB
                    const saved = await Messenger.create(messageData);

                    // Emit cho tất cả người trong phòng
                    this.io.to(roomId).emit('receive_message', {
                        ...messageData,
                        _id: saved._id
                    });

                    console.log(`Message sent in ${roomId}:`, content);
                } catch (err) {
                    console.error('Error saving message:', err);
                }
            });

            // Đánh dấu đã đọc
            socket.on('mark_as_read', async ({ conversationId, readerId }) => {
                try {
                    await Messenger.updateMany(
                        {
                            conversation_id: conversationId,
                            receiver_id: readerId,
                            is_read: false
                        },
                        { $set: { is_read: true } }
                    );
                    console.log(`Marked messages as read in conversation ${conversationId}`);
                } catch (err) {
                    console.error('Error marking messages as read:', err);
                }
            });

            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected`);
                this.users.delete(socket.userId);
            });
        });
    }
}

module.exports = SocketHandler;
