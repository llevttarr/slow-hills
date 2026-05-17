import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";

export default function About() {
  return (
    <main className="bg-[url('/placeholder.png')] bg-cover bg-center min-h-screen w-screen">
      <div className="flex flex-col items-center pt-20 gap-6">
        <h1 className="text-[128px] mb-4">Slow Hills</h1>

        <article className="w-[40%] text-4xl text-center pb-32">
          Slow Hills is a web sandbox application that generates 3D terrain with biomes. It also has an option to parse weather from a town the user enters. Feel free to roam the worlds you generate, explore the city's weather in an interactive way. <br />
          This site was created as a part of the "Web Technologies and Design" course in 2026 by Taras Levytskiy and Taras Kopach. Have fun!
        </article>

        <Link to="/app">
          <Button text="Begin" />
        </Link>
      </div>
    </main>
  )
}