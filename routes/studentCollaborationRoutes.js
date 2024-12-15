// routes/studentCollaborationRoutes.js
const express = require('express');
const http = require('http');
const controller = require('../controllers/StudentCollaborationController');

// Create an Express application
const app = express();
const server = http.createServer(app); // Create an HTTP server using the Express app

// User-related routes
app.post('/register', controller.registerUser);
app.post('/login', controller.loginUser);

// Group-related routes
app.post('/groups', controller.createGroup); // Changed to plural
app.post('/groups/join', controller.joinGroup);
app.get('/groups', controller.getGroups);

// Route for fetching messages for a specific group
app.get('/groups/:groupId/messages', controller.getGroupMessages);

// Setup socket for real-time messaging
controller.setupSocketIO(server);

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

module.exports = app; // Export the Express app if needed

