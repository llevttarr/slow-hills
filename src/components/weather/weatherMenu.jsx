import { React, useContext, useState } from "react";

import Button from "../button";
import Input from "../input";

import { weatherCodes } from "../../data/WeatherCodes";
import { updWeather } from "../../engine/renderer/renderer_instance";
import { WeatherContext } from "./weatherContext";

export default function WeatherMenu() {
  const { weaParams, setWeaParams } = useContext(WeatherContext);

  const [invalid, setInvalid] = useState(false);

  function clearWeather() {
    setInvalid(false);

    setWeaParams({
      query: "",
      city: "--",
      temperature: "--",
      weather: "--",
    });

    updWeather("Clear sky");
  }

  function handleWeather() {
    updWeather(weaParams.weather ?? "Clear sky");
  }

  async function handleSearch(e) {
    const value = e.target.value;

    setWeaParams((prev) => ({
      ...prev,
      query: value,
    }));

    if (!value.trim()) {
      setInvalid(true);

      setWeaParams({
        query: value,
        city: "--",
        temperature: "--",
        weather: "--",
      });

      return;
    }

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setInvalid(true);

        setWeaParams({
          query: value,
          city: "--",
          temperature: "--",
          weather: "--",
        });

        return;
      }

      const location = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`
      );

      const weatherData = await weatherResponse.json();

      setWeaParams({
        query: value,
        city: location.name,
        temperature: weatherData.current.temperature_2m,
        weather:
          weatherCodes[weatherData.current.weather_code] || "Unknown",
      });

      setInvalid(false);
    } catch (error) {
      setInvalid(true);

      setWeaParams({
        query: value,
        city: "--",
        temperature: "--",
        weather: "--",
      });
    }
  }

  return (
    <div className='flex justify-center p-6'>
      <div className="flex flex-col gap-8 text-4xl">
        <Input
          width={350}
          pholder="Enter location..."
          name="city"
          value={weaParams.query}
          onChange={handleSearch}
        />

        <h2>City: {weaParams.city}</h2>

        <h2>
          Temperature: {weaParams.temperature}
          {weaParams.temperature !== "--" ? " °C" : ""}
        </h2>

        <h2>Weather: {weaParams.weather}</h2>

        <p
          className={`text-red-400 pl-2 mt-4 text-2xl ${
            invalid ? "" : "invisible"
          }`}
        >
          Invalid city location
        </p>

        <div className='flex gap-4'>
          <Button text='Set' func={handleWeather} />
          <Button text='Clear' func={clearWeather} />
        </div>
      </div>
    </div>
  );
}