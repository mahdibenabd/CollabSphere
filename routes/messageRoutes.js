const express = require('express');
const { sendMessage } = require('../controllers/StudentCollaborationController');
const router = express.Router();
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const hash = crypto.createHash('sha256').update(file.originalname + Date.now().toString()).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    }
});

const upload = multer({ storage });

// Route to handle sending messages with file uploads
router.post('/groups/:groupId/messages', upload.single('file'), sendMessage);

module.exports = router; 