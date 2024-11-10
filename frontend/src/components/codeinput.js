import { useState } from "react"
import CodeBox from "./codeBox";
import CodeButton from "./codeButton";

export default function Codeinput({updater}){

    const [inputValue,setInputValue] = useState('')
    return(
        <div className="centered-flex">
            <CodeBox val = {inputValue} setVal = {setInputValue}/>
            <CodeButton val= {inputValue} setVal = {setInputValue} update={updater}/>
        </div>
    );
}