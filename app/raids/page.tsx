import NavBar from "@/components/NavBar";
import { RaidsClient } from "./raids-client";

export default function RaidsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 pt-24 pb-3 sm:pb-4 lg:pb-6">
        <RaidsClient />
      </div>
    </div>
  );
}
