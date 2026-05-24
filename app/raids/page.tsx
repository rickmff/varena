import NavBar from "@/components/NavBar";
import { RaidsClient } from "./raids-client";

export default function RaidsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-grey-950 to-grey-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.0055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.0055)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-red-500/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />
      <NavBar />
      <div className="relative z-10 max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-28 pb-3 sm:pb-4 lg:pb-6">
        <RaidsClient />
      </div>
    </div>
  );
}
