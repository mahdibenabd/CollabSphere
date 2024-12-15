// controllers/StudentCollaborationController.js
const { User, Message, StudyGroup, UserGroup } = require('../models');
const io = require('socket.io')();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a hashed filename
        const hash = crypto.createHash('sha256').update(file.originalname + Date.now().toString()).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${hash}${ext}`); // Save with hashed name and original extension
    }
});

const upload = multer({ storage });

exports.registerUser = async (req, res) => {
    try {
        const { username, password, email, userClass, department } = req.body;
        const user = await User.create({ username, password, email, userClass, department });
        res.status(201).send({ message: 'User registered successfully!', user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username, password } });
        if (user) {
            res.status(200).send({ message: 'User logged in successfully!', user });
        } else {
            res.status(404).send({ message: 'Invalid username or password!' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { groupName, creatorId, description } = req.body;
        const group = await StudyGroup.create({ name: groupName, creatorId, description });
        res.status(201).send({ message: 'Group created successfully!', group });
    } catch (error) {
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const group = await StudyGroup.findByPk(groupId);
        const user = await User.findByPk(userId);
        if (group && user) {
            await group.addUser(user);
            res.status(200).send({ message: 'User joined group successfully!' });
        } else {
            res.status(404).send({ message: 'Group or User not found!' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.findAll({
            where: { groupId },
            include: [
                {
                    model: User,  // Include the User model
                    as: 'user',    // Specify the alias here
                    attributes: ['username', 'department'],  // Select both username and department attributes
                }
            ],
            order: [['createdAt', 'ASC']],
            limit: 50
        });
        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};
exports.getGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.findAll();
        console.log('Fetched groups:', groups);
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).send({ message: 'Error: ' + error.message });
    }
};


// Setting up Socket.IO for real-time messaging
exports.setupSocketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
          origin: "http://localhost:3001",
          methods: ["GET", "POST"],
          credentials: true
        }
      });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a group
        socket.on('joinGroup', async ({ groupId, userId }) => {
            try {
                const group = await StudyGroup.findByPk(groupId);
                const user = await User.findByPk(userId);
                
                if (group && user) {
                    socket.join(`group_${groupId}`);
                    
                    // Load previous messages
                    const messages = await Message.findAll({
                        where: { groupId },
                        include: [
                            { model: User, attributes: ['username'] }
                        ],
                        order: [['createdAt', 'DESC']],
                        limit: 50 // Adjust the limit as needed
                    });
                    
                    // Emit previous messages to the user who just joined
                    socket.emit('previousMessages', messages);
                    
                    // Notify other users in the group
                    io.to(`group_${groupId}`).emit('userJoined', { 
                        message: `${user.username} joined the group`,
                        userId 
                    });
                }
            } catch (error) {
                console.error('Error joining group:', error);
            }
        });

        // Send message with file upload
        socket.on('sendMessage', async (data) => {
            try {
                const { groupId, userId, content, file } = data;

                // Save the file if it exists
                let filePath = null;
                if (file) {
                    const uploadResult = await new Promise((resolve, reject) => {
                        upload.single('file')(data, {}, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.file.path); // Get the file path
                            }
                        });
                    });
                    filePath = uploadResult; // Save the file path
                }

                // Save the message to the database
                const message = await Message.create({
                    content,
                    userId,
                    groupId,
                    filePath // Save the file path if it exists
                });

                // Emit the new message to the group
                io.to(`group_${groupId}`).emit('newMessage', { 
                    userId: message.userId,
                    content: message.content,
                    username: user.username // Include the username for display
                });

                console.log(`Message sent to group ${groupId}: ${content}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
