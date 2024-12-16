import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import io from 'socket.io-client';

function Chat({ user, groupId }) {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.emit('joinGroup', { groupId, userId: user.id });

        newSocket.on('previousMessages', (previousMessages) => {
            setMessages(previousMessages);
        });

        newSocket.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => newSocket.close();
    }, [groupId, user.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit('sendMessage', {
                groupId,
                userId: user.id,
                content: newMessage
            });
            setNewMessage('');
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <List>
                    {messages.map((message, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={message.content}
                                secondary={message.username}
                            />
                        </ListItem>
                    ))}
                </List>
                <div ref={messagesEndRef} />
            </Box>
            <Box component="form" onSubmit={sendMessage} sx={{ p: 2, backgroundColor: 'background.default' }}>
                <TextField
                    fullWidth
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    sx={{ mr: 1 }}
                />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
}

export default Chat;
