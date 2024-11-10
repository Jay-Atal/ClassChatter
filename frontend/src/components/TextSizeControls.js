import React from 'react';

export default function TextSizeControls({ scale, onScaleChange }) {
    const handleChange = (e) => {
        const newScale = parseFloat(e.target.value);
        onScaleChange(newScale);
    };

    return (
        <div className="text-size-slider">
            <span className="text-size-icon small">A</span>
            <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.2"
                value={scale}
                onChange={handleChange}
                className="slider"
            />
            <span className="text-size-icon large">A</span>
        </div>
    );
} 