import BuilderNavBar from "@/components/BuilderNavBar";
import BuildsList from "@/components/builds/BuildsList";

export default function Builds() {
  return (
    <div className="pt-20 min-h-screen bg-black">
      <BuilderNavBar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl text-white text-center mb-8">Your Builds</h1>
        <BuildsList />
      </div>
    </div>
  );
}
