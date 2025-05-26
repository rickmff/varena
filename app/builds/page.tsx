import BuilderNavBar from "@/components/BuilderNavBar";

export default function Builds() {
  return (
    <div className="pt-20 min-h-screen bg-black">
      <BuilderNavBar />
      <div className="h-96 flex flex-col items-center justify-center">
        <h1 className="text-3xl text-white text-center mb-8">Builds</h1>
        <p className="text-white text-center mb-4">
          Coming soon! Stay tuned for the latest builds and guides.
        </p>
      </div>
    </div>
  );
}
