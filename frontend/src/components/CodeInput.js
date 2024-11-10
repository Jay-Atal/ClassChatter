import { useState } from "react"
import CodeBox from "./CodeBox";
import CodeButton from "./CodeButton";

export default function CodeInput({join, host}){

    const [inputValue,setInputValue] = useState('')
    return(
        <div className="centered-flex">
            <CodeBox val = {inputValue} setVal = {setInputValue}/>
            <CodeButton val= {inputValue} setVal = {setInputValue} join = {join}/>
        </div>
    );
}