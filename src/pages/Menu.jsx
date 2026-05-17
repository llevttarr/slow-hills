import React from "react";
import App from "./App";
import Button from "../components/button";
import { Link } from "react-router-dom";


export default function Menu() {

  return (
    <main className="bg-[url('/placeholder.png')] bg-cover bg-center min-h-screen w-screen">
      <div className="flex flex-col items-center pt-20 gap-6">
        <h1 className="text-[128px] mb-32">Slow Hills</h1>

        <Link to="/app">
          <Button text="Begin" />
        </Link>

        <Link to="/about" className="underline text-2xl cursor-pointer">
          What is this?
        </Link>

      </div>
    </main>
  );
}