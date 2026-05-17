import React, { useEffect, useState } from "react";

export default function Slider({
  title = "Placeholder",
  min = 0,
  max = 100,
  step = 1,
  value = 67,
  onChange,
}) {
  const clampValue = (val) => {
    const num = Number(val)

    if (isNaN(num)) return min
    if (num < min) return min
    if (num > max) return max

    return num
  }

  const [currentValue, setCurrentValue] = useState(clampValue(value))

  useEffect(() => {
    setCurrentValue(clampValue(value))
  }, [value, min, max])

  const handleSliderChange = (e) => {
    const newValue = clampValue(e.target.value)

    setCurrentValue(newValue)

    if (onChange) {
      onChange(newValue)
    }
  }

  const handleInputChange = (e) => {
    const rawValue = e.target.value

    if (rawValue === "") {
      setCurrentValue("")
      return
    }

    const newValue = clampValue(rawValue)

    setCurrentValue(newValue)

    if (onChange) {
      onChange(newValue)
    }
  }

  const handleBlur = () => {
    const fixedValue = clampValue(currentValue)

    setCurrentValue(fixedValue)

    if (onChange) {
      onChange(fixedValue)
    }
  }

  const percentage = ((Number(currentValue || min) - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <h2 className="text-3xl">
        {title}
      </h2>

      <div className="flex items-center gap-7">
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue || min}
            onChange={handleSliderChange}
            className="slider w-full cursor-pointer rounded-full h-2"
            style={{
              background: `linear-gradient(
                90deg,
                black 0%,
                black ${percentage}%,
                #d0d0d0 ${percentage}%,
                #d0d0d0 100%
              )`
            }}
          />
        </div>

        <input
          type="number"
          value={currentValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          className="w-20 bg-transparent text-3xl text-center"
        />
      </div>

    </div>
  )
}
