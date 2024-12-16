import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';

function Chat({ user, groupId }) {  
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const [connectedUsername, setConnectedUsername] = useState(user.username);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.emit('joinGroup', { groupId, userId: user.id });

        newSocket.on('previousMessages', (previousMessages) => {
            console.log('Previous messages received:', previousMessages);
            setMessages(previousMessages);
        });

        newSocket.on('newMessage', (message) => {
            console.log('New message received:', message);
            setMessages(prev => {
                const exists = prev.some(msg => msg.id === message.id);
                if (!exists) {
                    return [...prev, { ...message, user: { username: connectedUsername } }];
                }
                return prev;
            });
        });

        return () => {
            newSocket.disconnect();
            newSocket.off();
        };
    }, [groupId, user.id, connectedUsername]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:4444/api/groups/${groupId}/messages`, { withCredentials: true });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [groupId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        console.log('Send button clicked');
        if (newMessage.trim() && socket) {
            const timestamp = new Date().toISOString();
            console.log('Sending message:', newMessage);

            const formData = new FormData();
            formData.append('groupId', groupId);
            formData.append('userId', user.id);
            formData.append('content', newMessage);
            formData.append('createdAt', timestamp);
            if (file) {
                formData.append('file', file);
            }

            // Emit the message and file to the server
            socket.emit('sendMessage', formData);

            // Optionally, you can also handle the response from the server
            // Here, we assume the server will return the saved message including the file path
            const response = await axios.post(`http://localhost:4444/api/groups/${groupId}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Add the new message to the state immediately
            setMessages(prev => [...prev, { 
                content: response.data.content, 
                user: { username: connectedUsername }, 
                createdAt: response.data.createdAt, 
                filePath: response.data.filePath // Use the file path returned from the server
            }]);
            setNewMessage('');
            setFile(null);
        } else {
            console.log('No message to send or socket not connected');
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <List>
                    {messages.map((message, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={
                                    <Typography variant="body1">
                                        {message.content}
                                        {message.filePath && (
                                            <a href={message.filePath} target="_blank" rel="noopener noreferrer">
                                                {` [File: ${message.filePath.split('/').pop()}]`}
                                            </a>
                                        )}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption" color="textSecondary">
                                        {`${message.user ? message.user.username : 'Unknown User'} (${message.user ? message.user.department : 'Unknown Department'}) at ${message.createdAt ? formatTimestamp(message.createdAt) : formatTimestamp(new Date().toISOString())}`}
                                    </Typography>
                                }
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
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ marginRight: '8px' }}
                />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
}

export default Chat;
