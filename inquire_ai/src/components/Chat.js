import React, { useState } from 'react';
import '../components/Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { sender: 'chatbot', text: 'Ask me anything about this paper!' }]); 
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setLoading(true);
        try {
            console.log("userInput: ", userInput)
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: userInput })
            });
    
            const data = await response.json();
            console.log(data.bot_response); 
            setMessages(prev => [...prev, { sender: 'chatbot', text: data.bot_response }]);
        } catch (error) {
            alert('Session expired: please log onto app again with your PDF and OpenAI API key.');
            console.error('Error sending message:', error);
        }
        setLoading(false);
        setUserInput("");
    };
    
    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
                {loading && 
                    <div className="message chatbot">
                        <div className="loading-container">
                            <div className="spinner"></div>
                            ⏳ Generating response (may take a while)...
                        </div>
                    </div>
                }
            </div>
            <form onSubmit={handleSubmit} className="chat-screen-form">
                <input 
                    className="chat-screen-input"
                    type="text" 
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button 
                    className='chat-screen-button'
                    type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;
