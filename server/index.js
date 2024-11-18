const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Redis setup
const redis = createClient({
    url: 'redis://localhost:6379'
});

redis.on('error', err => console.log('Redis Client Error', err));
redis.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
const connectRedis = async () => {
    await redis.connect();
};

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/basic-demo')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Message Schema
const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// Cache middleware
const cacheMessages = async (req, res, next) => {
    try {
        const cachedMessages = await redis.get('messages');
        if (cachedMessages) {
            console.log('Returning cached messages');
            return res.json(JSON.parse(cachedMessages));
        }
        next();
    } catch (error) {
        console.error('Cache error:', error);
        next();
    }
};

// Routes
// Get all messages (with cache)
app.get('/api/messages', cacheMessages, async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
        
        // Cache the result for 30 seconds
        await redis.setEx('messages', 30, JSON.stringify(messages));
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a message
app.post('/api/messages', async (req, res) => {
    try {
        const message = new Message({ text: req.body.text });
        await message.save();
        
        // Invalidate cache after new message
        await redis.del('messages');
        
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
const startServer = async () => {
    try {
        await connectRedis();
        const PORT = 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer();