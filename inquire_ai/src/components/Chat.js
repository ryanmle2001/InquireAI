import React, { useState } from 'react';
import '../components/Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]); // To store chat messages
    const [userInput, setUserInput] = useState(''); // To store user input

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        // Append user message to chat
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    
        try {
            //TODO get response from FastAPI
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userInput })
            });
    
            const data = await response.json();
            
            // Append chatbot's response to chat
            setMessages(prev => [...prev, { sender: 'chatbot', text: data.response }]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    
        // Clear user input field
        setUserInput('');
    };
    
    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="chat-screen-form">
                <input 
                    className="chat-screen-input"
                    type="text" 
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                />
                //TODO change colors
                <button 
                    className='chat-screen-button'
                    type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;
