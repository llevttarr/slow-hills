import React from "react";

export default function Button(props) {
    return (
        <div className="cursor-pointer text-4xl bg-mgray py-2 px-20 border-2 rounded-[20px] hover:font-bold">
            {props.text}
        </div>
    )
}