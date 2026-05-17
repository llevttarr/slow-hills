import React from "react";

export default function Input(props) {

  return (
    <div className="flex flex-col">
      {props.title && <h2 className="text-3xl pl-3">{props.title}</h2>}
      <input
        type="text"
        className={`rounded-[20px] pl-4 py-8 h-8 bg-lgray text-2xl outline-none w-full`}
        placeholder={props.pholder}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  )
}