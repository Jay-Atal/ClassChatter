export default function CodeButton({val, setVal, join}){

    const handleClick = () =>{
        setVal('')
        join()
    }
    return(
        <button onClick={handleClick} class= 'large-purple-button'>
            JOIN <i class="fa-solid fa-arrow-right"></i>
        </button>
    );
}