import { weatherCodes } from "../data/WeatherCodes";
const PRESETS = {
  default: {
    skyTop: [0.10, 0.30, 0.70],
    skyHorizon: [0.55, 0.75, 0.95],
    fogColor: [0.70, 0.82, 0.95],
    fogDensity: 0.0006,
    sunColor: [1.00, 0.98, 0.90],
    sunIntensity: 1.0,
    cloudCover: 0.0,
    precipitation: 0.0,
    snowfall: 0.0,
    ambientMult: 1.0,
  },
  clouds: {
    skyTop: [0.38, 0.40, 0.44],
    skyHorizon: [0.50, 0.52, 0.55],
    fogColor: [0.52, 0.54, 0.57],
    fogDensity: 0.003,
    sunColor: [0.85, 0.85, 0.88],
    sunIntensity: 0.4,
    cloudCover: 1.0,
    precipitation: 0.0,
    snowfall: 0.0,
    ambientMult: 0.75,
  },
  fog: {
    skyTop: [0.72, 0.74, 0.76],
    skyHorizon: [0.80, 0.82, 0.84],
    fogColor: [0.80, 0.82, 0.84],
    fogDensity: 0.025,
    sunColor: [0.90, 0.90, 0.92],
    sunIntensity: 0.25,
    cloudCover: 1.0,
    precipitation: 0.0,
    snowfall:0.0,
    ambientMult: 0.6,
  },
  rain: {
    skyTop: [0.20, 0.22, 0.28],
    skyHorizon: [0.30, 0.32, 0.38],
    fogColor: [0.35, 0.37, 0.42],
    fogDensity: 0.008,
    sunColor: [0.70, 0.72, 0.80],
    sunIntensity: 0.15,
    cloudCover: 1.0,
    precipitation: 0.8,
    snowfall: 0.0,
    ambientMult: 0.6,
  },
  heavyRain: {
    skyTop: [0.12, 0.14, 0.18],
    skyHorizon: [0.20, 0.22, 0.27],
    fogColor: [0.22, 0.25, 0.30],
    fogDensity: 0.015,
    sunColor: [0.60, 0.62, 0.70],
    sunIntensity: 0.05,
    cloudCover: 1.0,
    precipitation: 1.0,
    snowfall:  0.0,
    ambientMult: 0.5,
  },
  snow: {
    skyTop: [0.55, 0.58, 0.65],
    skyHorizon: [0.70, 0.72, 0.78],
    fogColor: [0.75, 0.76, 0.80],
    fogDensity: 0.006,
    sunColor: [0.92, 0.94, 1.00],
    sunIntensity: 0.35,
    cloudCover: 1.0,
    precipitation: 0.0,
    snowfall: 0.6,
    ambientMult: 0.9,
  },
  thunderstorm: {
    skyTop: [0.06, 0.07, 0.10],
    skyHorizon: [0.12, 0.13, 0.17],
    fogColor: [0.15, 0.16, 0.20],
    fogDensity: 0.018,
    sunColor: [0.50, 0.52, 0.60],
    sunIntensity: 0.0,
    cloudCover: 1.0,
    precipitation: 1.0,
    snowfall: 0.0,
    ambientMult: 0.4,
  },
};

const CODE_TO_PRESET = {
  0: 'default', 1: 'default',
  2: 'clouds', 3: 'clouds',
  45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain', 61: 'rain', 63: 'rain', 66: 'rain', 80: 'rain', 81: 'rain', 
  65: 'heavyRain', 67: 'heavyRain', 82: 'heavyRain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow', 85: 'snow', 86: 'snow',
  95: 'thunderstorm', 96: 'thunderstorm', 99: 'thunderstorm',
};

export function codeToVisuals(code, windDir = [0, 1], windSpeed = 0, temperature = 15) {
  const key = CODE_TO_PRESET[code] ?? 'default';
  const preset = PRESETS[key];
  return {
    ...preset,
    windDir,
    windSpeed,
    temperature,
    weatherCode: code,
    label: weatherCodes[code] ?? 'Unknown',
  };
}
export function defaultVisuals() {
  return codeToVisuals(0);
}
