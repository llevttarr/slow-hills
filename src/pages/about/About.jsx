import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/button";

export default function About() {
  return (
    <main className="bg-[url('/placeholder.png')] bg-cover bg-center min-h-screen w-screen">
    <div className="flex flex-col items-center pt-20 gap-6">
      <h1 className="text-[128px] mb-4">Slow Hills</h1>

      <article className="w-[40%] text-4xl text-center pb-32">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
      </article>
      
      <Link to="/placeholder">
        <Button text="Begin" />
      </Link>
    </div>
  </main>
  )
}