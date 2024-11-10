export default function HostRoomBtn({hostclick}){
    return (
        <button onClick={hostclick} className="action-button">
            HOST <i className="fa-solid fa-arrow-right"></i>
        </button>
    );
}