import BrakeSimulation from '@/components/BrakeSimulationWrapper';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Avi&apos;s Bremsweg-Simulation</h1>
      <BrakeSimulation />
    </main>
  );
}
