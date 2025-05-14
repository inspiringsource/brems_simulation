// File: src/components/ClientBrakeSimulation.tsx
'use client';                         // ← MUST be first line

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the heavy p5 component (BrakeSimulation)
// to ensure it never executes on the server.
const BrakeSimulation = dynamic(
  () => import('./BrakeSimulation'),
  { ssr: false }
);

interface Props {
  locale: 'en' | 'de';
}

export default function ClientBrakeSimulation({ locale }: Props) {
  return <BrakeSimulation locale={locale} />;
}
