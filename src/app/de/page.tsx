// File: src/app/de/page.tsx
"use client"; // ← also a client component

// Make sure the path is correct; adjust if the file is in a different location, for example:
// Adjust the import path and filename casing if necessary
import ClientBrakeSimulation from "../../components/ClientBrakeSimulation"; // Check if the file

export default function GermanPage() {
  return <ClientBrakeSimulation locale="de" />;
}
