import BuildGenerator from "@/components/vbuilds/BuildGenerator";
import "./page.css";
export default function Guides() {
  return (
    <div className="pt-20 h-screen bg-zinc-950 bg-blend-lighten overflow-hidden space-y-8">
      <BuildGenerator />
    </div>
  );
}
