import "./page.css";
import BuildProvider from "@/components/vbuilds/BuildProvider";
import BuildGenerator from "@/components/vbuilds/BuildGenerator";
import TrollPopupWrapper from "@/components/TrollPopupWrapper";

export const metadata = {
  title: "V Arena - Build Editor",
  description: "Create and manage your builds",
};

export default function BuildEditor() {
  return (
    <>
      <TrollPopupWrapper />
      <div className="pt-20 h-screen bg-zinc-950 bg-blend-lighten overflow-hidden space-y-8 flex">
        <BuildProvider>
          <BuildGenerator />
        </BuildProvider>
      </div>
    </>
  );
}
