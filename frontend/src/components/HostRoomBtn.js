export default function HostRoomBtn({hostclick}){

    const handleClick = ()=>{
        hostclick()
    }
    return(
        <button onClick={handleClick} className= 'large-purple-button'>
            HOST <i className="fa-solid fa-arrow-right"></i>
        </button>
    );
}