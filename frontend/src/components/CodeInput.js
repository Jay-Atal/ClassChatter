import React, { useState } from "react";
import CodeBox from "./CodeBox";
import CodeButton from "./CodeButton";
import HostRoomBtn from "./HostRoomBtn";

export default function CodeInput({ join, host }) {
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <h2>Welcome to Chat</h2>
                <div className="button-group">
                    <HostRoomBtn hostclick={host} />
                    <div className="input-group">
                        <CodeBox val={inputValue} setVal={setInputValue} />
                        <CodeButton val={inputValue} setVal={setInputValue} join={join} />
                    </div>
                </div>
            </div>
        </div>
    );
}