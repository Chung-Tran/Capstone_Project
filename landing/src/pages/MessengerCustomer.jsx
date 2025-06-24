import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Image,
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    Loader2,
    AlertCircle
} from 'lucide-react';
import messengerService from '../services/messenger.service';
import { useNavigate } from 'react-router-dom';


// Component hiển thị danh sách cuộc trò chuyện
const ConversationList = ({
    conversations,
    selectedId,
    onSelectConversation,
    searchTerm,
    onSearchChange,
    loading,
    error
}) => {
    const filteredConversations = conversations.filter(conv =>
        conv.store?.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="w-1/3 bg-white border-r border-gray-200 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-1/3 bg-white border-r border-gray-200 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Tin nhắn</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Danh sách cuộc trò chuyện */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p>Chưa có cuộc trò chuyện nào</p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const lastMessage = conversation.lastMessage;
                        const store = conversation.store;

                        return (
                            <div
                                key={conversation._id || store?._id}
                                onClick={() => onSelectConversation(store?._id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selectedId === store?._id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={store?.store_logo || '/api/placeholder/40/40'}
                                            alt={store?.store_name || 'Store'}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/api/placeholder/40/40';
                                            }}
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {store?.store_name || 'Cửa hàng'}
                                            </h3>
                                            <span className="text-xs text-gray-500 ml-2">
                                                {lastMessage?.created_at ?
                                                    new Date(lastMessage.created_at).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : ''
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm text-gray-600 truncate">
                                                {lastMessage?.message_type === 'image' ?
                                                    'Đã gửi hình ảnh' :
                                                    lastMessage?.content || 'Chưa có tin nhắn'
                                                }
                                            </p>
                                            {conversation.unreadCount > 0 && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full ml-2">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Component hiển thị chi tiết cuộc trò chuyện
const ChatDetail = ({
    storeId,
    storeInfo,
    messages,
    onSendMessage,
    onLoadMoreMessages,
    loading,
    sendingMessage
}) => {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (message.trim() && !sendingMessage) {
            await onSendMessage(storeId, message, 'text');
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleImageUpload = async (file) => {
        setIsUploading(true);
        try {
            // Tạo URL tạm thời cho preview
            const imageUrl = URL.createObjectURL(file);

            // Trong thực tế, bạn sẽ upload lên Cloudinary hoặc server
            // const uploadedUrl = await uploadToCloudinary(file);

            await onSendMessage(storeId, imageUrl, 'image', file);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStatus = (status) => {
        switch (status) {
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-500" />;
            default:
                return null;
        }
    };

    if (!storeId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một cuộc trò chuyện</h3>
                    <p className="text-gray-500">Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={storeInfo?.store_logo || '/api/placeholder/40/40'}
                                alt={storeInfo?.store_name || 'Store'}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">
                                {storeInfo?.store_name}
                            </h3>
                            <p className="text-sm text-gray-500">Đang hoạt động</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs lg:max-w-md ${msg.sender_type === 'customer' ? 'order-2' : 'order-1'}`}>
                            {msg.message_type === 'text' ? (
                                <div
                                    className={`px-4 py-2 rounded-lg ${msg.sender_type === 'customer'
                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            ) : msg.message_type === 'image' ? (
                                <div
                                    className={`rounded-lg overflow-hidden ${msg.sender_type === 'customer' ? 'rounded-br-sm' : 'rounded-bl-sm'
                                        }`}
                                >
                                    <img
                                        src={msg.image || msg.content}
                                        alt="Sent image"
                                        className="max-w-full h-auto"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/200/150';
                                        }}
                                    />
                                </div>
                            ) : null}
                            <div className={`flex items-center mt-1 space-x-1 ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                                }`}>
                                <span className="text-xs text-gray-500">
                                    {formatTime(msg.created_at)}
                                </span>
                                {msg.sender_type === 'customer' && getMessageStatus(msg.status)}
                            </div>
                        </div>
                    </div>
                ))}
                {sendingMessage && (
                    <div className="flex justify-end">
                        <div className="max-w-xs lg:max-w-md">
                            <div className="px-4 py-2 rounded-lg bg-blue-400 text-white rounded-br-sm opacity-70">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Đang gửi...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || sendingMessage}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || sendingMessage}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Image className="w-5 h-5" />
                        )}
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            disabled={sendingMessage}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                            rows="1"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Smile className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendingMessage}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendingMessage ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component chính
const MessengerCustomer = ({ messageId }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [storeInfo, setStoreInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    // Load danh sách cuộc trò chuyện
    useEffect(() => {
        loadConversationList();
    }, []);

    // Xử lý route parameter
    useEffect(() => {
        if (messageId) {
            setSelectedStoreId(messageId);
            loadMessengerInfo(messageId);
        }
    }, [messageId]);

    const loadConversationList = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await messengerService.getConversationList();
            if (response.isSuccess) {
                setConversations(response.data.conversations || []);

                // Nếu chưa có store được chọn và có conversations, chọn conversation đầu tiên
                if (!selectedStoreId && response.data.conversations?.length > 0) {
                    const firstConversation = response.data.conversations[0];
                    const firstStoreId = firstConversation.store?._id;
                    if (firstStoreId) {
                        setSelectedStoreId(firstStoreId);
                        loadMessengerInfo(firstStoreId);
                    }
                }
            } else {
                setError(response.message || 'Không thể tải danh sách cuộc trò chuyện');
            }
        } catch (error) {
            console.error('Error loading conversation list:', error);
            setError('Lỗi khi tải danh sách cuộc trò chuyện');
        } finally {
            setLoading(false);
        }
    };

    const loadMessengerInfo = async (storeId) => {
        try {
            setChatLoading(true);
            const response = await messengerService.getMessengerInfo(storeId);
            if (response.isSuccess) {
                setStoreInfo(response.data.storeInfo);
                setMessages(response.data.chatHistory || []);

                // Đánh dấu tin nhắn đã đọc
                await messengerService.markMessagesAsRead(storeId);
            } else {
                console.error('Failed to load messenger info:', response.message);
            }
        } catch (error) {
            console.error('Error loading messenger info:', error);
        } finally {
            setChatLoading(false);
        }
    };

    const handleSelectConversation = (storeId) => {
        setSelectedStoreId(storeId);
        loadMessengerInfo(storeId);
        navigate(`/messenger/${storeId}`); // <-- cập nhật URL
    };

    const handleSendMessage = async (storeId, content, messageType, file = null) => {
        try {
            setSendingMessage(true);

            const messageData = {
                storeId,
                content,
                messageType,
                image: messageType === 'image' ? content : null
            };

            const response = await messengerService.sendMessage(messageData);

            if (response.isSuccess) {
                // Thêm tin nhắn mới vào danh sách
                setMessages(prev => [...prev, response.data.message]);

                // Cập nhật conversation list
                setConversations(prev => prev.map(conv => {
                    if (conv.store?._id === storeId) {
                        return {
                            ...conv,
                            lastMessage: response.data.message,
                            unreadCount: 0
                        };
                    }
                    return conv;
                }));
            } else {
                console.error('Failed to send message:', response.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleLoadMoreMessages = async (storeId, page = 1) => {
        try {
            const response = await messengerService.getMessageHistory(storeId, page);
            if (response.isSuccess) {
                const newMessages = response.data.messages || [];
                setMessages(prev => [...newMessages, ...prev]);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        }
    };

    return (
        <div className="h-[90vh] flex bg-gray-100">
            <ConversationList
                conversations={conversations}
                selectedId={selectedStoreId}
                onSelectConversation={handleSelectConversation}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                loading={loading}
                error={error}
            />
            <ChatDetail
                storeId={selectedStoreId}
                storeInfo={storeInfo}
                messages={messages}
                onSendMessage={handleSendMessage}
                onLoadMoreMessages={handleLoadMoreMessages}
                loading={chatLoading}
                sendingMessage={sendingMessage}
            />
        </div>
    );
};

export default MessengerCustomer;