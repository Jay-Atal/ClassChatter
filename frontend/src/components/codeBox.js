
export default function CodeBox({val,setVal}){

    
    return(<input
        className = "large-scaling-input"
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="input code to join"
        />
    );
}