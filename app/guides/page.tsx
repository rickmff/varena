import BuildGenerator from "@/components/vbuilds/BuildGenerator";
import NavBar from "@/components/NavBar";
export default function Guides() {
  return (
    <div className="pt-20">
      <NavBar />
      <BuildGenerator user={"user"} />
    </div>
  );
}



