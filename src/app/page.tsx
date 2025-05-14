// File: src/app/page.tsx
"use client"; // ← ensure this page itself is a client component

import ClientBrakeSimulation from "../components/ClientBrakeSimulation";

export default function Home() {
  return <ClientBrakeSimulation locale="en" />;
}
