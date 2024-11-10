import React, { useState, useEffect } from 'react';
import ChatApp from './components/ChatApp';
import ThemeToggle from './components/ThemeToggle';
import TextSizeControls from './components/TextSizeControls';
import './styles/theme.css';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [textScale, setTextScale] = useState(parseFloat(localStorage.getItem('textScale')) || 1.0);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.style.setProperty('--text-scale', textScale);
        localStorage.setItem('textScale', textScale);
    }, [textScale]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="App">
            <div className="controls-container">
                <TextSizeControls scale={textScale} onScaleChange={setTextScale} />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            <header className="app-header">
                <h1>Class Chatter</h1>
            </header>
            <ChatApp />
        </div>
    );
}

export default App;
