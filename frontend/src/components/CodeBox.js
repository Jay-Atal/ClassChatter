export default function CodeBox({val, setVal, onEnter}) {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && onEnter) {
            onEnter();
        }
    };

    return (
        <input
            className="code-box"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter code to join"
        />
    );
}