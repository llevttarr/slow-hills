import { useState, useEffect, createContext } from 'react'

import Input from '../components/input'
import Button from '../components/button'
import Slider from '../components/slider'
import Key from '../components/key'

import { weatherCodes } from '../data/WeatherCodes'
import Visualization from './vis/Visualization'
import { rerun, updWeather } from '../engine/renderer/renderer_instance'
import GenerationForm from '../components/generation/generationForm'
import GenerationProvider from '../components/generation/generationContext'
import WeatherMenu from '../components/weather/weatherMenu'

export const WorldContext = createContext(false);

export default function App() {
  const [worldTab, setWorldTab] = useState(false);
  const [weathTab, setWeathTab] = useState(false);
  const [contrTab, setContrTab] = useState(false);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setWorldTab(false);
        setWeathTab(false);
        setContrTab(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => { window.removeEventListener("keydown", handleEscape); }
  }, []);

  function WorldTab() {


    return (
      <div className='bg-bblack w-full h-full absolute z-999 flex justify-center'>
        <div className='rounded-[20px] border-2 bg-mgray w-180 h-194  p-6 mt-10'>
          <nav className='flex justify-center items-center mb-8'>
            <span className='text-5xl mr-auto'>Generate New World</span>
            <div className='select-none cursor-pointer text-4xl' onClick={() => { setWorldTab(false) }}>X</div>
          </nav>
          <WorldContext.Provider value={{ worldTab, setWorldTab }}>
            <GenerationProvider>
              <GenerationForm />
            </GenerationProvider>
          </WorldContext.Provider>
        </div>
      </div>
    )
  }

  function WeatherTab() {
    return (
      <div className='bg-bblack w-full h-full absolute z-999 flex justify-center'>
        <div className='rounded-[20px] border-2 bg-mgray w-190 h-150 p-6 mt-20'>
          <nav className='flex justify-center items-center mb-4'>
            <span className='text-5xl mr-auto'>Set Weather</span>
            <div className='select-none cursor-pointer text-4xl' onClick={() => { setWeathTab(false) }}>X</div>
          </nav>
          <WeatherMenu/>
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

      <Visualization />

    </main>
  )
}
