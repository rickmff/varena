"use client";

/**
 * Migrates builds from localStorage.vbuilds to the database via the API.
 * This function should only be called on the client side after a user is authenticated.
 *
 * Expected localStorage format:
 * [{"code":"...","timestamp":"2025-11-08T15:17:13.207Z","name":"Build 1"}]
 * [{"code":"522222222icbj6i1256r1246312458c08B7b07B8g628Ef028En379Dr528Ei64B9o128E41111623","timestamp":"2025-11-08T15:17:13.207Z","name":"Build 1"}]
 *
 * After successful migration, the vbuilds key is removed from localStorage.
 */
export async function migrateLocalBuilds(): Promise<{ migrated: number; failed: number }> {
  // Early return if not in browser environment
  if (typeof window === "undefined") {
    return { migrated: 0, failed: 0 };
  }

  try {
    // Check if vbuilds key exists in localStorage
    const vbuildsData = localStorage.getItem("vbuilds");

    // If key doesn't exist or is empty, skip migration
    if (!vbuildsData || vbuildsData.trim() === "") {
      return { migrated: 0, failed: 0 };
    }

    // Parse the JSON data
    let builds: Array<{ code: string; timestamp?: string; name: string }>;
    try {
      builds = JSON.parse(vbuildsData);
    } catch (parseError) {
      console.error("Failed to parse vbuilds from localStorage:", parseError);
      // If parsing fails, clear the invalid data
      localStorage.removeItem("vbuilds");
      return { migrated: 0, failed: 0 };
    }

    // Validate that it's an array and not empty
    if (!Array.isArray(builds) || builds.length === 0) {
      // If empty array, clear it and return
      localStorage.removeItem("vbuilds");
      return { migrated: 0, failed: 0 };
    }

    // Filter out invalid builds (must have code and name)
    const validBuilds = builds.filter(
      (build) => build && typeof build.code === "string" && typeof build.name === "string" && build.code.trim() !== "" && build.name.trim() !== ""
    );

    if (validBuilds.length === 0) {
      // No valid builds, clear localStorage
      localStorage.removeItem("vbuilds");
      return { migrated: 0, failed: 0 };
    }

    console.log(`[Migration] Found ${validBuilds.length} build(s) in localStorage to migrate`);

    // Migrate each build using Promise.allSettled to handle failures gracefully
    const migrationResults = await Promise.allSettled(
      validBuilds.map(async (build) => {
        try {
          const response = await fetch("/api/builds", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: build.name.trim(),
              code: build.code.trim(),
              // Optional fields can be left empty - API will handle defaults
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `HTTP ${response.status}`;

            // If build with same name already exists, treat as non-fatal (already migrated)
            if (response.status === 400 && errorMessage.includes("already exists")) {
              console.log(`[Migration] Build "${build.name}" already exists, skipping`);
              return { status: "skipped" as const, build: build.name };
            }

            throw new Error(`Failed to migrate build "${build.name}": ${errorMessage}`);
          }

          const migratedBuild = await response.json();
          console.log(`[Migration] Successfully migrated build: "${build.name}"`);
          return { status: "success" as const, build: build.name };
        } catch (error) {
          console.error(`[Migration] Error migrating build "${build.name}":`, error);
          throw error;
        }
      })
    );

    // Count successes and failures
    let migrated = 0;
    let failed = 0;

    migrationResults.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value.status === "success") {
          migrated++;
        }
        // Skipped builds don't count as migrated or failed
      } else {
        failed++;
      }
    });

    // Clear localStorage after migration attempt (even if some failed)
    // This ensures we don't retry on every login
    localStorage.removeItem("vbuilds");
    console.log(`[Migration] Completed: ${migrated} migrated, ${failed} failed`);

    return { migrated, failed };
  } catch (error) {
    console.error("[Migration] Unexpected error during migration:", error);
    // Clear localStorage even on unexpected errors to prevent retry loops
    try {
      localStorage.removeItem("vbuilds");
    } catch (clearError) {
      console.error("[Migration] Failed to clear localStorage:", clearError);
    }
    return { migrated: 0, failed: 0 };
  }
}

