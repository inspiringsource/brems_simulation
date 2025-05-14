'use client';

import React, { useRef, useState } from 'react';
import Sketch from 'react-p5';
import type p5Types from 'p5';

const BrakeSimulation: React.FC = () => {
  const frictionCoefficient = 0.7811;
  const gravity = 9.81;
  const mass = 1300; // kg
  const initialSpeedKmh = 240;
  const initialSpeed = initialSpeedKmh / 3.6;
  const deceleration = frictionCoefficient * gravity;
  const brakingDistanceCalculated = (initialSpeed ** 2) / (2 * deceleration);

  const pixelsPerMeter = 3;
  const carWidth = 50;
  const carHeight = 25;
  const maxDistance = 1500; // simulation limit

  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBraking, setIsBraking] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [brakePosition, setBrakePosition] = useState<number | null>(null);
  const [simulationEnded, setSimulationEnded] = useState(false);

  const scrollX = useRef(0);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(900, 250).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(240);
    const dt = 1 / 60;

    if (simulationStarted && !simulationEnded) {
      if (!isBraking) {
        setPosition((prev) => prev + speed * dt);
      } else if (speed > 0) {
        setPosition((prev) => prev + speed * dt);
        setSpeed((prev) => Math.max(prev - deceleration * dt, 0));

        if (speed <= 0.1) {
          setSpeed(0);
          setSimulationEnded(true);
        }
      }

      if (position >= maxDistance) {
        setSimulationEnded(true);
      }
    }

    // Camera follows car, stops jitter after simulation end
    const targetScroll = Math.max(0, position * pixelsPerMeter - 100);
    scrollX.current = simulationEnded ? scrollX.current : targetScroll;

    // Infinite Road
    p5.fill(80);
    p5.rect(-scrollX.current, 150, (maxDistance + 500) * pixelsPerMeter, 100);

    // Skid mark
    if (brakePosition !== null) {
      p5.fill(0, 0, 0, 150);
      const skidStartX = brakePosition * pixelsPerMeter - scrollX.current;
      const skidEndX = position * pixelsPerMeter - scrollX.current;
      p5.rect(skidStartX, 170, skidEndX - skidStartX, 5);

      // Brake arrow
      p5.fill('red');
      p5.triangle(
        skidStartX, 140,
        skidStartX - 5, 130,
        skidStartX + 5, 130
      );
      p5.text('Brake Start', skidStartX - 20, 125);
    }

    // Car
    const carX = position * pixelsPerMeter - scrollX.current;
    p5.fill(0, 150, 250);
    p5.rect(carX, 150 - carHeight / 2, carWidth, carHeight);

    // Car stopped arrow
    if (simulationEnded && isBraking && speed === 0) {
      const stopX = position * pixelsPerMeter - scrollX.current;
      p5.fill('green');
      p5.triangle(
        stopX, 140,
        stopX - 5, 130,
        stopX + 5, 130
      );
      p5.text('Car Stopped', stopX - 20, 125);
    }

    // Display Data Clearly
    p5.fill(0);
    p5.textSize(13);
    p5.text(`Speed: ${speed.toFixed(2)} m/s (${(speed * 3.6).toFixed(1)} km/h)`, 10, 20);
    p5.text(`Position: ${position.toFixed(2)} m`, 10, 40);
    p5.text(`Friction (μ): ${frictionCoefficient}`, 10, 60);
    p5.text(`Mass: ${mass} kg`, 10, 80);
    p5.text(
      `Braking Distance: ${isBraking ? (position - brakePosition!).toFixed(2) : brakingDistanceCalculated.toFixed(2)} m`,
      10, 100
    );
  };

  const handleStart = () => {
    setSpeed(initialSpeed);
    setSimulationStarted(true);
  };

  const handleBrake = () => {
    if (simulationStarted && !isBraking) {
      setBrakePosition(position);
      setIsBraking(true);
    }
  };

  const handleRestart = () => {
    setSpeed(0);
    setPosition(0);
    setIsBraking(false);
    setBrakePosition(null);
    setSimulationStarted(false);
    setSimulationEnded(false);
    scrollX.current = 0;
  };

  return (
    <div className="p-4 overflow-x-auto">
      {!simulationStarted && (
        <button
          type="button"
          onClick={handleStart}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 mr-2"
        >
          Start Simulation
        </button>
      )}
      {simulationStarted && !simulationEnded && (
        <button
          type="button"
          onClick={handleBrake}
          className="bg-red-500 text-white px-4 py-2 rounded mb-4 mr-2"
          disabled={isBraking}
        >
          Brake Now!
        </button>
      )}
      {(simulationEnded || simulationStarted) && (
        <button
          type="button"
          onClick={handleRestart}
          className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        >
          Restart Simulation
        </button>
      )}
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default BrakeSimulation;
