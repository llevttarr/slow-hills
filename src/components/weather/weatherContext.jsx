import { React, useState, createContext } from "react";

export const WeatherContext = createContext();

export default function WeatherProvider({ children }) {
  const WeatherParams = {
    city: "--",
    temperature: "--",
    weather: "--"
  }  

  const [weaParams, setWeaParams] = useState(WeatherParams);
  return (
    <WeatherContext.Provider value={{ weaParams, setWeaParams }}>
      {children}
    </WeatherContext.Provider>
  )
}