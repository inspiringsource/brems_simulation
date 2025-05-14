'use client';

import React, { useRef } from 'react';
import Sketch from 'react-p5';
import type p5Types from 'p5';

const BrakeSimulation: React.FC = () => {
  const frictionCoefficient = 0.7811;
  const gravity = 9.81;
  const initialSpeedKmh = 240;
  const initialSpeed = initialSpeedKmh / 3.6;
  const deceleration = frictionCoefficient * gravity;
  const brakingDistance = (initialSpeed ** 2) / (2 * deceleration);

  const pixelsPerMeter = 3; // Keep a good visual scale
  const carWidth = 50;
  const carHeight = 25;

  const speed = useRef(initialSpeed);
  const position = useRef(0);
  const isBraking = useRef(false);
  const brakingStartPosition = useRef(0);

  const setup = (p5: p5Types, canvasParentRef: Element): void => {
    p5.createCanvas(900, 250).parent(canvasParentRef);
    speed.current = initialSpeed;
    position.current = 0;
    isBraking.current = false;
    brakingStartPosition.current = 0;
  };

  const draw = (p5: p5Types): void => {
    p5.background(240);

    const dt = 1 / 60;

    // Update physics
    if (!isBraking.current) {
      position.current += speed.current * dt;
    } else if (speed.current > 0) {
      position.current += speed.current * dt;
      speed.current -= deceleration * dt;
      speed.current = Math.max(speed.current, 0);
    }

    // Calculate camera offset to follow car
    const carScreenX = 100; // Car stays at 100px from left of canvas
    const offsetX = carScreenX - position.current * pixelsPerMeter;

    // Draw road
    p5.fill(80);
    p5.rect(0, 150, p5.width, 100);

    // Braking distance line
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    const brakingLineX = brakingStartPosition.current * pixelsPerMeter + offsetX;
    p5.line(brakingLineX, 140, brakingLineX + brakingDistance * pixelsPerMeter, 140);
    p5.noStroke();

    // Skid mark
    if (isBraking.current) {
      const skidStartX = brakingStartPosition.current * pixelsPerMeter + offsetX;
      const skidEndX = position.current * pixelsPerMeter + offsetX;
      p5.fill(0, 0, 0, 150);
      p5.rect(skidStartX, 170, skidEndX - skidStartX, 5);
    }

    // Car
    p5.fill(0, 150, 250);
    p5.rect(carScreenX, 150 - carHeight / 2, carWidth, carHeight);

    // Live info
    p5.fill(0);
    p5.textSize(14);
    p5.text(`Initial Speed: ${initialSpeedKmh} km/h`, 50, 20);
    p5.text(`Friction (μ): ${frictionCoefficient}`, 50, 40);
    p5.text(`Braking Distance: ${brakingDistance.toFixed(2)} m`, 50, 60);
    p5.text(`Current Position: ${position.current.toFixed(2)} m`, 50, 80);
    p5.text(`Current Speed: ${speed.current.toFixed(2)} m/s`, 50, 100);
  };

  const handleStartBraking = () => {
    if (!isBraking.current) {
      isBraking.current = true;
      brakingStartPosition.current = position.current;
    }
  };

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={handleStartBraking}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Brake Now!
      </button>
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default BrakeSimulation;
