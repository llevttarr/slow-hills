import { useState, useEffect } from 'react'

import Input from '../components/input'
import Button from '../components/button'
import Slider from '../components/slider'
import Key from '../components/key'

import { weatherCodes } from '../data/WeatherCodes'

function App() {
  const [worldTab, setWorldTab] = useState(false)
  const [weathTab, setWeathTab] = useState(false)
  const [contrTab, setContrTab] = useState(false)


  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setWorldTab(false)
        setWeathTab(false)
        setContrTab(false)
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => { window.removeEventListener("keydown", handleEscape) }
  }, [])

  function WorldTab() {
    return (
      <div className='bg-bblack w-full h-full absolute z-999 flex justify-center'>
        <div className='rounded-[20px] border-2 bg-mgray w-180 h-194  p-6 mt-10'>
          <nav className='flex justify-center items-center mb-8'>
            <span className='text-5xl mr-auto'>Generate New World</span>
            <div className='select-none cursor-pointer text-4xl' onClick={() => { setWorldTab(false) }}>X</div>
          </nav>

          <div className='flex flex-col items-center gap-8'>
            <div className='flex gap-8 max-w-3xl'>
              <Input title='World Width' pholder='Enter width...' width='130' />
              <Input title='World Length' pholder='Enter length...' width='130' />
            </div>

            <div className='grid grid-cols-2 gap-8'>
              <Slider title='Cell Size' />
              <Slider title='Region Quantity' />
              <Slider title='Chunk Size' />
              <Slider title='Height Intensity' />
              <Slider title='Object Internsity' />
              <Slider title='Aging Rate' />
            </div>

            <nav className='w-[50%] flex flex-col gap-8'>
              <Input pholder="Enter seed..." name="seed" title='World Seed' />
              <Button text="Generate" />
            </nav>
          </div>
        </div>
      </div>
    )
  }

  function WeatherTab() {
    const [query, setQuery] = useState("")
    const [city, setCity] = useState("--")
    const [temperature, setTemperature] = useState("--")
    const [weather, setWeather] = useState("--")
    const [invalid, setInvalid] = useState(false)

    // move to separate file

    function clearWeather() {
      setQuery("")
      setInvalid(false)
      setWeather("--")
      setTemperature("--")
      setCity("--")
    }

    async function handleSearch(e) {
      setQuery(e.target.value)

      if (!query.trim()) {
        setInvalid(true)
        setCity("--")
        setTemperature("--")
        setWeather("--")
        return
      }

      try {
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`
        )

        const geoData = await geoResponse.json()

        if (!geoData.results || geoData.results.length === 0) {
          setInvalid(true)
          setCity("--")
          setTemperature("--")
          setWeather("--")
          return
        }

        const location = geoData.results[0]

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`
        )

        const weatherData = await weatherResponse.json()

        setCity(location.name)
        setTemperature(weatherData.current.temperature_2m)
        setWeather(
          weatherCodes[weatherData.current.weather_code] || "Unknown"
        )

        setInvalid(false)
      } catch (error) {
        setInvalid(true)
        setCity("--")
        setTemperature("--")
        setWeather("--")
      }
    }

    return (
      <div className='bg-bblack w-full h-full absolute z-999 flex justify-center'>
        <div className='rounded-[20px] border-2 bg-mgray w-190 h-150 p-6 mt-20'>
          <nav className='flex justify-center items-center mb-4'>
            <span className='text-5xl mr-auto'>Set Weather</span>
            <div className='select-none cursor-pointer text-4xl' onClick={() => { setWeathTab(false) }}>X</div>
          </nav>

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
        </div>
      </div>
    )
  }

  function ControlsTab() {
    return (
      <div className='bg-bblack w-full h-full absolute z-999 flex justify-center'>
        <div className='rounded-[20px] border-2 bg-mgray w-230 h-102 p-6 mt-20'>
          <nav className='flex justify-center items-center mb-8'>
            <span className='text-5xl mr-auto'>Controls</span>
            <div className='select-none cursor-pointer text-4xl' onClick={() => { setContrTab(false) }}>X</div>
          </nav>
          <div className="flex items-start justify-between gap-12">
            <div className="flex flex-col items-center">
              <h2 className="mb-5 text-4xl leading-none">
                Move:
              </h2>

              <div className="flex flex-col items-center gap-3">
                <Key keyName="W" />

                <div className="flex gap-3">
                  <Key keyName="A" />
                  <Key keyName="S" />
                  <Key keyName="D" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center">
                <h2 className="mb-3 text-4xl leading-none">
                  Up:
                </h2>
                <Key keyName="Space" big />
              </div>

              <div className="flex flex-col items-center">
                <h2 className="mb-3 text-4xl leading-none">
                  Down:
                </h2>
                <Key keyName="Shift" big />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center">
                <h2 className="mb-3 text-4xl leading-none text-center">
                  Toggle movement:
                </h2>
                <Key keyName="R" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="mb-3 text-4xl leading-none">
                  Cruise:
                </h2>
                <Key keyName="G" />
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <main>
      {worldTab && <WorldTab />}
      {weathTab && <WeatherTab />}
      {contrTab && <ControlsTab />}

      <nav className="flex items-center w-full absolute bottom-0 bg-(image:--gradient-fade) h-30">
        <div className="flex gap-10 mt-8 ml-6 relative top-0 text-3xl text-white">
          <div className="cursor-pointer hover:font-bold" onClick={() => { setWorldTab(true) }}>World</div>
          <div className="cursor-pointer hover:font-bold" onClick={() => { setWeathTab(true) }}>Weather</div>
          <div className="cursor-pointer hover:font-bold" onClick={() => { setContrTab(true) }}>Controls</div>
        </div>
      </nav>
    </main>
  )
}

export default App
