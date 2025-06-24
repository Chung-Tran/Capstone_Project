import React, { useEffect, useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

import useChat from '../../hooks/useChat';
import { useSocketContext } from '../../contexts/SocketContext';

const MessengerSeller = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const { socket, sendMessage, on } = useSocketContext();
    const [chats] = useState([
        {
            id: 1,
            customer: 'Nguyễn Văn A',
            lastMessage: 'Sản phẩm này còn hàng không ạ?',
            time: '10:30',
            unread: true
        },
        {
            id: 2,
            customer: 'Trần Thị B',
            lastMessage: 'Cảm ơn shop',
            time: '09:15',
            unread: false
        },
        // Thêm các cuộc trò chuyện mẫu khác
    ]);

    // Giả sử mỗi chat có id là roomId
    useEffect(() => {
        if (!selectedChat || !socket) return;
        socket.emit('join_room', selectedChat.id);

        const cleanup = on('receive_message', (msg) => {
            setChatMessages((prev) => [...prev, msg]);
        });

        return () => {
            cleanup && cleanup();
        };
    }, [selectedChat, socket, on]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue && selectedChat) {
            sendMessage(inputValue, selectedChat.id);
            setInputValue('');
        }
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.16))]">
            <h1 className="text-2xl font-bold mb-6">Tin nhắn</h1>

            <div className="bg-white rounded-lg shadow h-full flex">
                {/* Chat List */}
                <div className="w-1/3 border-r">
                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin nhắn..."
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-theme(spacing.16))]">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-gray-50' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium">{chat.customer}</h3>
                                    <span className="text-sm text-gray-500">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            {/* ...existing code... */}
                            <div className="flex-1 p-4 overflow-y-auto">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className="mb-2">
                                        <span className="font-semibold">{msg.senderName}: </span>
                                        <span>{msg.content}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t">
                                <form className="flex space-x-2" onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 border rounded-lg px-4 py-2"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                    />
                                    <button className="p-2 bg-blue-500 text-white rounded-lg" type="submit">
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Chọn một cuộc trò chuyện để bắt đầu
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessengerSeller; 