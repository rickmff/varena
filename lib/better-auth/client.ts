"use client";

import { createAuthClient } from "better-auth/react";

// Get base URL - prioritize environment variable, fallback to window.location.origin
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // In browser, use window.location.origin or env variable
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
});

