const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(`mongodb://localhost:27017/basic-demo`).
then(() => console.log('Connected to MongoDB')).
catch(err => console.error('MongoDB connection error:', err));

// Basic Message Schema
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

// Routes
// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
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
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});