import React from 'react';

export default function ThemeToggle({ theme, toggleTheme }) {
    return (
        <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
} 