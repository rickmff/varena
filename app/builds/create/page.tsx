import "./page.css";
import BuildProvider from "@/components/vbuilds/BuildProvider";
import BuildGenerator from "@/components/vbuilds/BuildGenerator";
export default function Guides() {
  return (
    <div className="pt-20 h-screen bg-zinc-950 bg-blend-lighten overflow-hidden space-y-8">
      <BuildProvider>
        <BuildGenerator />
      </BuildProvider>
    </div>
  );
}
