'use client';

import dynamic from 'next/dynamic';

const BrakeSimulation = dynamic(() => import('./BrakeSimulation'), {
  ssr: false,
});

export default BrakeSimulation;
