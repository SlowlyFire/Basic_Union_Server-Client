import { useState, useEffect } from 'react';

export default function App() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [status, setStatus] = useState('');

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/messages');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            setStatus('Error loading messages');
        }
    };

    // Load messages on component mount
    useEffect(() => {
        fetchMessages();
    }, []);

    // Submit new message
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newMessage }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            setNewMessage('');
            fetchMessages();
            setStatus('Message sent successfully!');
            
            // Clear status after 3 seconds
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus('Error sending message');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Basic Message Board</h1>

            {/* Message Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full p-2 border rounded mb-2"
                    required
                />
                <button 
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Send Message
                </button>
            </form>

            {/* Status Message */}
            {status && (
                <div className="mb-4 p-2 text-center bg-gray-100 rounded">
                    {status}
                </div>
            )}

            {/* Messages List */}
            <div className="space-y-2">
                {messages.map(message => (
                    <div 
                        key={message._id}
                        className="p-3 bg-gray-100 rounded"
                    >
                        <p>{message.text}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
  }