/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import Sketch from 'react-p5';

export type Locale = 'en' | 'de';
interface Props { locale: Locale }

const translations: Record<Locale, any> = {
  en: {
    start: 'Start Simulation',
    brake: 'Brake Now!',
    restart: 'Restart Simulation',
    speed: 'Speed',
    position: 'Position',
    friction: 'μ (friction)',
    mass: 'Mass',
    brakingDist: 'Braking Dist',
    brakeStart: 'Brake Start',
    carStopped: 'Car Stopped',
    unit: { ms: 'm/s', kmh: 'km/h', m: 'm', kg: 'kg' },
  },
  de: {
    start: 'Simulation starten',
    brake: 'Jetzt bremsen!',
    restart: 'Simulation neu starten',
    speed: 'Geschwindigkeit',
    position: 'Position',
    friction: 'μ (Reibung)',
    mass: 'Masse',
    brakingDist: 'Bremsweg',
    brakeStart: 'Bremsbeginn',
    carStopped: 'Fahrzeug gestoppt',
    unit: { ms: 'm/s', kmh: 'km/h', m: 'm', kg: 'kg' },
  },
};

const BrakeSimulation: React.FC<Props> = ({ locale }) => {
  const t = translations[locale];

  const μ = 0.7811;
  const g = 9.81;
  const mass = 1300;
  const initialSpeedKmh = 240;
  const initialSpeed = initialSpeedKmh / 3.6;
  const decel = μ * g;
  const calcBrakingDist = initialSpeed**2 / (2 * decel);

  const ppm = 3;
  const carW = 50;
  const carH = 25;
  const maxDist = 1500;

  const speedRef = useRef(0);
  const posRef = useRef(0);
  const brakeAtRef = useRef<number|null>(null);
  const scrollX = useRef(0);

  const [started, setStarted] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [ended, setEnded] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = (p5: any, parentRef: Element) => {
    // Responsive canvas: full width of parent, aspect ratio 4:1
    const width = parentRef instanceof HTMLElement ? parentRef.clientWidth : window.innerWidth;
    const height = width / 4;
    p5.createCanvas(width, height).parent(parentRef);
    p5.windowResized = () => {
      const w = parentRef instanceof HTMLElement ? parentRef.clientWidth : window.innerWidth;
      p5.resizeCanvas(w, w / 4);
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = (p5: any) => {
    p5.background(240);
    const dt = 1/60;

    if (started && !ended) {
      if (!isBraking) {
        posRef.current += speedRef.current * dt;
      } else if (speedRef.current > 0) {
        posRef.current += speedRef.current * dt;
        speedRef.current = Math.max(speedRef.current - decel*dt, 0);
        if (speedRef.current <= 0.1) {
          speedRef.current = 0;
          setEnded(true);
        }
      }
      if (posRef.current >= maxDist) setEnded(true);
    }

    const rawX = posRef.current * ppm;
    const midX = p5.width/2;
    let carX;
    if (rawX < midX) {
      scrollX.current = 0;
      carX = rawX;
    } else {
      scrollX.current = rawX - midX;
      carX = midX;
    }

    // Draw road full width plus buffer
    p5.fill(80);
    p5.rect(-scrollX.current, p5.height*0.6, (maxDist+500)*ppm, p5.height*0.4);

    // Skid mark & brake start
    if (brakeAtRef.current !== null) {
      const startX = brakeAtRef.current*ppm - scrollX.current;
      const length = carX - startX;
      p5.fill(0,0,0,150);
      p5.rect(startX, p5.height*0.6 + 20, length, 5);
      p5.fill('red');
      p5.triangle(startX, p5.height*0.6, startX-5, p5.height*0.6-10, startX+5, p5.height*0.6-10);
      p5.textSize(16);
      p5.fill('red');
      p5.text(t.brakeStart, startX-30, p5.height*0.6-15);
    }

    // Draw car
    p5.fill(0,150,250);
    p5.rect(carX, p5.height*0.6 - carH/2, carW, carH);

    // Car stopped arrow
    if (ended && isBraking && speedRef.current===0) {
      p5.fill('green');
      p5.triangle(carX, p5.height*0.6, carX-5, p5.height*0.6-10, carX+5, p5.height*0.6-10);
      p5.textSize(16);
      p5.fill('green');
      p5.text(t.carStopped, carX-30, p5.height*0.6-15);
    }

    // Overlay stats
    p5.fill(0);
    p5.textSize(13);
    p5.text(`${t.speed}: ${speedRef.current.toFixed(2)} ${t.unit.ms} (${(speedRef.current*3.6).toFixed(1)} ${t.unit.kmh})`, 10,20);
    p5.text(`${t.position}: ${posRef.current.toFixed(2)} ${t.unit.m}`, 10,40);
    p5.text(`${t.friction}: ${μ}`, 10,60);
    p5.text(`${t.mass}: ${mass} ${t.unit.kg}`, 10,80);
    p5.text(`${t.brakingDist}: ${isBraking ? (posRef.current - (brakeAtRef.current||0)).toFixed(2) : calcBrakingDist.toFixed(2)} ${t.unit.m}`, 10,100);
  };

  const handleStart = () => {
    speedRef.current = initialSpeed;
    posRef.current = 0;
    brakeAtRef.current = null;
    scrollX.current = 0;
    setEnded(false);
    setIsBraking(false);
    setStarted(true);
  };

  const handleBrake = () => {
    if (started && !isBraking) {
      brakeAtRef.current = posRef.current;
      setIsBraking(true);
    }
  };

  const handleRestart = () => {
    speedRef.current = 0;
    posRef.current = 0;
    brakeAtRef.current = null;
    scrollX.current = 0;
    setStarted(false);
    setIsBraking(false);
    setEnded(false);
  };

  return (
    <div className="p-2 overflow-x-auto max-w-full">
      {/* Avis Bremsweg simulator */}
      <h2 className="text-lg font-bold mb-2">Avi&apos;s Bremsweg simulator</h2>
      {!started && (
        <button type="button" onClick={handleStart} className="bg-blue-500 text-white px-4 py-2 rounded mb-2 mr-2">
          {t.start}
        </button>
      )}
      {started && !isBraking && (
        <button type="button" onClick={handleBrake} className="bg-red-500 text-white px-4 py-2 rounded mb-2 mr-2">
          {t.brake}
        </button>
      )}
      {(started || ended) && (
        <button type="button" onClick={handleRestart} className="bg-gray-500 text-white px-4 py-2 rounded mb-2">
          {t.restart}
        </button>
      )}
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default BrakeSimulation;
