export default function CodeButton({val,setVal,update}){

    const handleClick = () =>{
        setVal('')
        update()
    }
    return(
        <button onClick={handleClick} class= 'large-purple-button'>
            JOIN <i class="fa-solid fa-arrow-right"></i>
        </button>
    );
}