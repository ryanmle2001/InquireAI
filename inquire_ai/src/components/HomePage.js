import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isFileValid, setIsFileValid] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isApiKeyValid, setIsApiKeyValid] = useState(false);
    const [isAccessGranted, setIsAccessGranted] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('http://localhost:8000/validate-key', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey })
              });
    
            const data = await response.json();
            if (data.valid) {
                setIsApiKeyValid(true);
            } else {
                setIsApiKeyValid(false);
                alert('OpenAI API key is not valid.');
            }
        } catch (error) {
            alert('Error inputting OpenAI API key:', error);
        }

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.valid) {
                setIsFileValid(true);
            } else {
                setIsFileValid(false);
                alert('Failed to upload file: ', data.message);
            }
        } catch (error) {
            alert('Error uploading file:', error);
        }
    };

    const navigateToChat = async () => {
        const formData = new FormData();
        formData.append('file', file);    
            
        await fetch('http://localhost:8000/create', {
            method: 'POST',
            body: formData
        });
        navigate('/chat');
    };
    
    
    return (
        <div className="container">
            <div className="box">
                <h1 className="header">Welcome to My Web App</h1>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        required
                    />
                    <input
                        type="text"
                        placeholder="Paste your OpenAI API key here"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                    />
                    <button type="submit">Validate API Key & Upload</button>
                </form>
                {isApiKeyValid && isFileValid && <button className="chat-button" onClick={navigateToChat}>Chat</button>}
            </div>
        </div>
    )
}

export default HomePage;
