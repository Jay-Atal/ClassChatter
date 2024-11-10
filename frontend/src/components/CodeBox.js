export default function CodeBox({val, setVal}){
    return (
        <input
            className="code-box"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Enter code to join"
        />
    );
}