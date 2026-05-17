import React from "react";

export default function Key(props) {
  return (
    <div className={`h-16 ${props.big ? "w-48 text-2xl flex items-center" : "w-16 text-4xl  justify-center items-center flex "} select-none bg-lgray p-2 rounded-[20px]`}>
      {props.keyName}      
    </div>
  )
}