// app.js
const express = require('express');
const sequelize = require('./config/database');
const studentCollaborationRoutes = require('./routes/studentCollaborationRoutes');
const http = require('http');
const socketIo = require('socket.io');
const { setupSocketIO } = require('./controllers/StudentCollaborationController');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Routes
app.use('/api', studentCollaborationRoutes);

// Database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        // Sync models (consider removing force: true in production)
        sequelize.sync({ force: true })
            .then(() => {
                // Setup Socket.IO
                setupSocketIO(io);

                // Start the server
                const PORT = process.env.PORT || 4444;
                server.listen(PORT, () => {
                    console.log(`Server is running on http://localhost:${PORT}`);
                });
            });
    })
    .catch(error => console.error('Unable to connect to the database:', error));

// Error handling for server startup
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try another port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});
