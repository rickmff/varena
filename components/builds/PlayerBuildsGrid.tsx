"use client";

import { BuildContent } from "./BuildsList";
import "@/components/vbuilds/styles.css";

type Build = {
  id: string;
  name: string;
  code: string;
  upvotes: number;
  downvotes: number;
};

export default function PlayerBuildsGrid({ builds }: { builds: Build[] }) {
  if (!builds.length) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {builds.map((build) => (
        <BuildContent
          key={build.id}
          buildId={build.id}
          name={build.name}
          code={build.code}
          upvotes={build.upvotes}
          buildLink={`/builds/create?build=${encodeURIComponent(build.code)}`}
          showPublicToggle={false}
          isAuthenticated={false}
        />
      ))}
    </div>
  );
}
