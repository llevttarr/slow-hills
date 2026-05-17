import { React, useState, useContext } from "react";
import { GenerationContext } from "./generationContext";

import Input from "../input";
import Slider from "../slider";
import Button from "../button";
import { rerun } from "../../engine/renderer/renderer_instance";
import { WorldContext } from "../../pages/App";

export default function GenerationForm() {

  const { genParams, setParams } = useContext(GenerationContext);
  const { worldTab, setWorldTab } = useContext(WorldContext);

  function handleChange(e) {
    console.log(genParams);
    
    const { name, value } = e.target;

    setParams(prev => ({
      ...prev,
      [name]: name === "seed" ? value : Number(value)
    }));
  };

  function handleGeneration() {
    setWorldTab(false);
    rerun(genParams);
  }

  return (
    <form className='flex flex-col items-center gap-8' onChange={handleChange}>
      <div className='flex gap-8 w-full'>
        <Input name="xSize" title='World Width' pholder='Enter width...' />
        <Input name="zSize" title='World Length' pholder='Enter length...' />
      </div>

      <div className='grid grid-cols-2 gap-8'>
        <Slider name="cellSize" title='Cell Size' min={1} max={67} />
        <Slider name="numRegions" title='Region Quantity' max={3}  />
        <Slider name="genChunkSize" title='Chunk Size' min={512} max={4096} />
        <Slider name="heightIntensity" title='Height Intensity' max={222} />
        <Slider name="objectIntensity" title='Object Internsity' />
        <Slider name="agingRate" title='Aging Rate' min={0.001} max={0.5} step={0.001} />
      </div>

      <nav className='w-[50%] flex flex-col gap-8'>
        <Input pholder="Enter seed..." name="seed" title='World Seed' />
        <Button text="Generate" func={handleGeneration} />
      </nav>
    </form>
  )
};