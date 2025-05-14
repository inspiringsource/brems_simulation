'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import Sketch from 'react-p5';

type Locale = 'en' | 'de';

interface BrakeSimulationProps {
  locale: Locale;
}

const translations: Record<Locale, {
  start: string;
  brake: string;
  restart: string;
  speed: string;
  position: string;
  friction: string;
  mass: string;
  brakingDist: string;
  brakeStart: string;
  carStopped: string;
  unit: { ms: string; kmh: string; m: string; kg: string };
}> = {
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

const BrakeSimulation: React.FC<BrakeSimulationProps> = ({ locale }) => {
  const t = translations[locale];

  // Physics constants
  const frictionCoefficient = 0.7811;
  const gravity = 9.81;
  const mass = 1300; // kg
  const initialSpeedKmh = 240;
  const initialSpeed = initialSpeedKmh / 3.6; // ≈66.67 m/s
  const deceleration = frictionCoefficient * gravity;
  const brakingDistanceCalculated = initialSpeed ** 2 / (2 * deceleration);

  // Visualization settings
  const pixelsPerMeter = 3;
  const carWidth = 50;
  const carHeight = 25;
  const maxDistance = 1500;

  // Simulation state
  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBraking, setIsBraking] = useState(false);
  const [started, setStarted] = useState(false);
  const [brakePosition, setBrakePosition] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);

  // Scrolling offset
  const scrollX = useRef(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = (p5: any, canvasParentRef: Element) => {
    p5.createCanvas(900, 250).parent(canvasParentRef);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = (p5: any) => {
    p5.background(240);
    const dt = 1 / 60;

    // Advance simulation if running
    if (started && !ended) {
      if (!isBraking) {
        setPosition((pos) => pos + speed * dt);
      } else if (speed > 0) {
        setPosition((pos) => pos + speed * dt);
        setSpeed((v) => Math.max(v - deceleration * dt, 0));
        if (speed <= 0.1) {
          setSpeed(0);
          setEnded(true);
        }
      }
      if (position >= maxDistance) {
        setEnded(true);
      }
    }

    // Smooth camera follow until end
    const target = Math.max(0, position * pixelsPerMeter - 100);
    if (!ended) scrollX.current = target;

    // Draw the road
    p5.fill(80);
    p5.rect(-scrollX.current, 150, (maxDistance + 500) * pixelsPerMeter, 100);

    // Draw skid mark if braking started
    if (brakePosition !== null) {
      const startX = brakePosition * pixelsPerMeter - scrollX.current;
      const length = position * pixelsPerMeter - scrollX.current - startX;
      p5.fill(0, 0, 0, 150);
      p5.rect(startX, 170, length, 5);

      // Brake arrow
      p5.fill('red');
      p5.triangle(startX, 140, startX - 5, 130, startX + 5, 130);
      p5.text(t.brakeStart, startX - 20, 125);
    }

    // Draw car
    const carX = position * pixelsPerMeter - scrollX.current;
    p5.fill(0, 150, 250);
    p5.rect(carX, 150 - carHeight / 2, carWidth, carHeight);

    // Draw stop arrow if ended
    if (ended && isBraking && speed === 0) {
      const stopX = carX;
      p5.fill('green');
      p5.triangle(stopX, 140, stopX - 5, 130, stopX + 5, 130);
      p5.text(t.carStopped, stopX - 20, 125);
    }

    // Overlay text data
    p5.fill(0);
    p5.textSize(13);
    p5.text(
      `${t.speed}: ${speed.toFixed(2)} ${t.unit.ms} (${(speed * 3.6).toFixed(1)} ${t.unit.kmh})`,
      10,
      20
    );
    p5.text(`${t.position}: ${position.toFixed(2)} ${t.unit.m}`, 10, 40);
    p5.text(`${t.friction}: ${frictionCoefficient}`, 10, 60);
    p5.text(`${t.mass}: ${mass} ${t.unit.kg}`, 10, 80);
    p5.text(
      `${t.brakingDist}: ${
        isBraking
          ? (position - (brakePosition ?? 0)).toFixed(2)
          : brakingDistanceCalculated.toFixed(2)
      } ${t.unit.m}`,
      10,
      100
    );
  };

  // Handlers
  const handleStart = () => {
    setSpeed(initialSpeed);
    setStarted(true);
  };
  const handleBrake = () => {
    if (started && !isBraking) {
      setBrakePosition(position);
      setIsBraking(true);
    }
  };
  const handleRestart = () => {
    setSpeed(0);
    setPosition(0);
    setIsBraking(false);
    setBrakePosition(null);
    setStarted(false);
    setEnded(false);
    scrollX.current = 0;
  };

  return (
    <div className="p-4 overflow-x-auto">
      {!started && (
        <button
          type="button"
          onClick={handleStart}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 mr-2"
        >
          {t.start}
        </button>
      )}
      {started && !ended && (
        <button
          type="button"
          onClick={handleBrake}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4 mr-2"
          disabled={isBraking}
        >
          {t.brake}
        </button>
      )}
      {(started || ended) && (
        <button
          type="button"
          onClick={handleRestart}
          className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        >
          {t.restart}
        </button>
      )}
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default BrakeSimulation;
