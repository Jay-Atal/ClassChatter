export default function CodeButton({val, setVal, join}){
    const handleClick = () => {
        setVal('');
        join(); // join(val);
    }

    return (
        <button onClick={handleClick} className="action-button">
            JOIN <i className="fa-solid fa-arrow-right"></i>
        </button>
    );
}