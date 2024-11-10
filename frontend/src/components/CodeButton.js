export default function CodeButton({val, setVal, join}){
    const handleClick = () => {
        if (!val) return; // Don't proceed if no value
        join(val.trim()); // Pass the trimmed room ID value
        setVal('');
    }

    return (
        <button onClick={handleClick} className="action-button">
            JOIN <i className="fa-solid fa-arrow-right"></i>
        </button>
    );
}