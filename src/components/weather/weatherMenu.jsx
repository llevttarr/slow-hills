import { React, useState } from "react";

import Button from "../button";
import Input from "../input";
import Key from "../key";

import { weatherCodes } from "../../data/WeatherCodes";

export default function WeatherMenu() {

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("--");
  const [temperature, setTemperature] = useState("--");
  const [weather, setWeather] = useState("--");
  const [invalid, setInvalid] = useState(false);

  function clearWeather() {
    setQuery("");
    setInvalid(false);
    setWeather("--");
    setTemperature("--");
    setCity("--");
  };

  async function handleSearch(e) {
    setQuery(e.target.value);

    if (!query.trim()) {
      setInvalid(true);
      setCity("--");
      setTemperature("--");
      setWeather("--");
      return
    };

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setInvalid(true);
        setCity("--");
        setTemperature("--");
        setWeather("--");
        return
      };

      const location = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`
      );

      const weatherData = await weatherResponse.json();

      setCity(location.name);
      setTemperature(weatherData.current.temperature_2m);
      setWeather(
        weatherCodes[weatherData.current.weather_code] || "Unknown"
      );

      setInvalid(false);
    } catch (error) {
      setInvalid(true);
      setCity("--");
      setTemperature("--");
      setWeather("--");
    }
  }

  return (
    <div className='flex justify-center p-6'>

      <div className="flex flex-col gap-8 text-4xl">
        <Input
          width={350}
          pholder="Enter location..."
          name="city"
          value={query}
          onChange={handleSearch}
        />
        <h2>City: {city}</h2>
        <h2>Temperature: {temperature} {temperature !== "--" ? "°C" : ""}</h2>
        <h2>Weather: {weather}</h2>

        <p className={`text-red-400 pl-2 mt-4 text-2xl ${invalid ? "" : "invisible"}`}>
          Invalid city location
        </p>

        <div className='flex gap-4'>
          <Button text='Set' func={() => { console.log("pressed") }} />
          <Button text='Clear' func={clearWeather} />
        </div>
      </div>
    </div>
  )
}