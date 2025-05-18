import React, { useState } from 'react';
import { PaperAirplaneIcon, MagnifyingGlassIcon, PhotoIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const Messages = () => {
    // Fake data với nhiều tin nhắn và trạng thái khác nhau
    const [chats] = useState([
        {
            id: 1,
            customer: {
                name: 'Nguyễn Văn A',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'Sản phẩm này còn hàng không ạ?',
            time: '10:30',
            unread: true,
            status: 'new'
        },
        {
            id: 2,
            customer: {
                name: 'Trần Thị B',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'Cảm ơn shop nhiều, tôi sẽ đánh giá 5 sao!',
            time: '09:15',
            unread: false,
            status: 'completed'
        },
        {
            id: 3,
            customer: {
                name: 'Lê Minh C',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'Cho mình hỏi thời gian giao hàng?',
            time: '08:45',
            unread: true,
            status: 'pending'
        },
        {
            id: 4,
            customer: {
                name: 'Phạm Hoàng D',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'Mình muốn đổi sang màu xanh được không?',
            time: 'Hôm qua',
            unread: false,
            status: 'pending'
        },
        {
            id: 5,
            customer: {
                name: 'Hoàng Thị E',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'OK shop, cảm ơn nhiều',
            time: 'Hôm qua',
            unread: false,
            status: 'completed'
        },
        {
            id: 6,
            customer: {
                name: 'Vũ Quốc F',
                avatar: '/api/placeholder/40/40'
            },
            lastMessage: 'Shop có ship COD không ạ?',
            time: '12/05',
            unread: false,
            status: 'new'
        }
    ]);
    
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [messages, setMessages] = useState({
        1: [
            { id: 1, text: 'Chào shop!', isCustomer: true, time: '10:25' },
            { id: 2, text: 'Sản phẩm này còn hàng không ạ?', isCustomer: true, time: '10:30' }
        ],
        2: [
            { id: 1, text: 'Shop ơi, mình muốn đặt sản phẩm áo phông size M', isCustomer: true, time: '09:00' },
            { id: 2, text: 'Dạ chào anh/chị, sản phẩm áo phông size M còn hàng ạ. Anh/chị có thể đặt hàng ngay ạ', isCustomer: false, time: '09:05' },
            { id: 3, text: 'Mình vừa đặt xong, cảm ơn shop', isCustomer: true, time: '09:10' },
            { id: 4, text: 'Cảm ơn shop nhiều, tôi sẽ đánh giá 5 sao!', isCustomer: true, time: '09:15' }
        ],
        3: [
            { id: 1, text: 'Chào shop, mình vừa đặt 1 áo khoác đen', isCustomer: true, time: '08:40' },
            { id: 2, text: 'Cho mình hỏi thời gian giao hàng?', isCustomer: true, time: '08:45' }
        ],
        4: [
            { id: 1, text: 'Shop ơi, mình đặt áo màu đỏ nhưng giờ đổi ý', isCustomer: true, time: '23:30' },
            { id: 2, text: 'Mình muốn đổi sang màu xanh được không?', isCustomer: true, time: '23:35' }
        ],
        5: [
            { id: 1, text: 'Mình cần tư vấn về size quần', isCustomer: true, time: '12:40' },
            { id: 2, text: 'Mình cao 1m70, nặng 65kg thì nên chọn size nào?', isCustomer: true, time: '12:42' },
            { id: 3, text: 'Dạ với chiều cao và cân nặng này anh/chị nên chọn size L để thoải mái ạ', isCustomer: false, time: '12:50' },
            { id: 4, text: 'OK shop, cảm ơn nhiều', isCustomer: true, time: '12:55' }
        ],
        6: [
            { id: 1, text: 'Shop có ship COD không ạ?', isCustomer: true, time: '15:30' }
        ]
    });

    const sendMessage = () => {
        if (!messageInput.trim() || !selectedChat) return;
        
        const newMessage = {
            id: messages[selectedChat.id].length + 1,
            text: messageInput,
            isCustomer: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages({
            ...messages,
            [selectedChat.id]: [...messages[selectedChat.id], newMessage]
        });
        
        setMessageInput('');
    };

    const filteredChats = chats.filter(chat => {
        if (filterStatus === 'all') return true;
        return chat.status === filterStatus;
    });

    const getStatusLabel = (status) => {
        switch (status) {
            case 'new': return 'Mới';
            case 'pending': return 'Đang xử lý';
            case 'completed': return 'Hoàn thành';
            default: return '';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg h-[calc(100vh-theme(spacing.8))] overflow-hidden">
                <div className="flex h-full">
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h1 className="text-xl font-bold text-gray-800">Tin nhắn</h1>
                            <p className="text-sm text-gray-500 mt-1">Quản lý các cuộc trò chuyện với khách hàng</p>
                        </div>
                        
                        {/* Search & Filter */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tin nhắn..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                            
                            <div className="flex space-x-2 mt-3 overflow-x-auto py-1">
                                <button 
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Tất cả
                                </button>
                                <button 
                                    onClick={() => setFilterStatus('new')}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Mới
                                </button>
                                <button 
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Đang xử lý
                                </button>
                                <button 
                                    onClick={() => setFilterStatus('completed')}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Hoàn thành
                                </button>
                            </div>
                        </div>
                        
                        {/* Chat List */}
                        <div className="overflow-y-auto flex-1">
                            {filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                                        } ${chat.unread ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start">
                                            <div className="relative mr-3">
                                                <img 
                                                    src={chat.customer.avatar} 
                                                    alt={chat.customer.name}
                                                    className="w-10 h-10 rounded-full bg-gray-200"
                                                />
                                                {chat.unread && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">{chat.customer.name}</h3>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{chat.time}</span>
                                                </div>
                                                <p className={`text-sm truncate ${chat.unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                                    {chat.lastMessage}
                                                </p>
                                                <div className="mt-1 flex items-center">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(chat.status)}`}>
                                                        {getStatusLabel(chat.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    Không có tin nhắn nào phù hợp
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 flex flex-col">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <img 
                                            src={selectedChat.customer.avatar} 
                                            alt={selectedChat.customer.name}
                                            className="w-10 h-10 rounded-full bg-gray-200 mr-3"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-900">{selectedChat.customer.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedChat.status)}`}>
                                                {getStatusLabel(selectedChat.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                            <TagIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                            <ClockIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                    <div className="space-y-3">
                                        {messages[selectedChat.id].map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.isCustomer ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                                                        msg.isCustomer
                                                            ? 'bg-white text-gray-800 border border-gray-200'
                                                            : 'bg-blue-500 text-white'
                                                    }`}
                                                >
                                                    <p>{msg.text}</p>
                                                    <div className={`text-xs mt-1 ${msg.isCustomer ? 'text-gray-500' : 'text-blue-100'}`}>
                                                        {msg.time}
                                                        {!msg.isCustomer && (
                                                            <CheckCircleIcon className="w-3 h-3 inline ml-1" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <div className="flex items-end space-x-2">
                                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                            <PhotoIcon className="w-6 h-6" />
                                        </button>
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                placeholder="Nhập tin nhắn..."
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                rows={2}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <button 
                                            onClick={sendMessage}
                                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                        >
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                                        <div>Enter để gửi, Shift+Enter để xuống dòng</div>
                                        <div>Phản hồi thường trong 5 phút</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <PaperAirplaneIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Tin nhắn của shop</h3>
                                <p className="text-center max-w-md mb-4">
                                    Chọn một cuộc trò chuyện để xem tin nhắn và phản hồi khách hàng nhanh chóng
                                </p>
                                <p className="text-sm text-gray-400">
                                    Thời gian phản hồi trung bình: 5 phút
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;