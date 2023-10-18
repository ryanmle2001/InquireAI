import React, { useState, useRef, useEffect } from 'react';
import '../components/Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { sender: 'chatbot', text: 'Ask me anything about this paper!' }]); 
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (userInput.trim() === '') {
            alert('Please input a message.');
            setUserInput("");
            return;
        }
    
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
            <div className="header-container">
                <h1 className="header">InquireAI</h1>
                <h2 className="header">Research Assistant powered by GPT4</h2>
            </div>
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text.split('\n').map((line, lineIndex) => (
                            <span key={lineIndex}>
                                {line}
                                {lineIndex !== message.text.split('\n').length - 1 && <br />}
                            </span>
                        ))}
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
            <div ref={messagesEndRef}></div>
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
                    type="submit"
                    disabled={loading}>Send</button>
            </form>
        </div>
    );
}

export default Chat;
