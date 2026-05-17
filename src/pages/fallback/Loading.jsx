import { React, useEffect, useState } from "react";

export default function Loading() {
  const [dot, setDot] = useState("")
  useEffect(() => {
    const interval = setInterval(() => {
      setDot(d => (d.length >= 3 ? "" : d + "."));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-[url('/placeholder.png')] bg-cover bg-center min-h-screen w-screen">
      <div className="flex flex-col w-full items-center">
        <h1 className="text-6xl mt-90 text-center">Loading{dot}</h1>
      </div>
    </main>
  )
}