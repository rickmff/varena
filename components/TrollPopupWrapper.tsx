"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TrollPopup from "./TrollPopup";

export default function TrollPopupWrapper() {
  const searchParams = useSearchParams();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if there's a 'build' query parameter
    const buildParam = searchParams.get("build");
    if (buildParam) {
      // Show popup when build parameter is present
      setShowPopup(true);
    }
  }, [searchParams]);

  return (
    <TrollPopup
      isOpen={showPopup}
      onClose={() => setShowPopup(false)}
    />
  );
}

