import { React, useState, createContext } from "react";
import { DEFAULT_PARAMS } from "../../core/params";

export const GenerationContext = createContext();

export default function GenerationProvider({ children }) {
  const [genParams, setParams] = useState(DEFAULT_PARAMS);
  return (
    <GenerationContext.Provider value={{ genParams, setParams }}>
      {children}
    </GenerationContext.Provider>
  )
}