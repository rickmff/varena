"use client";

/**
 * Migrates tier lists from localStorage.vtierlists to the database via the API.
 * This function should only be called on the client side after a user is authenticated.
 *
 * Expected localStorage format:
 * [{"id":"local-...","name":"Tier List Name","tiers":{...},"isPublic":false,"timestamp":"..."}]
 *
 * After successful migration, the vtierlists key is removed from localStorage.
 */
export async function migrateLocalTierLists(): Promise<{ migrated: number; failed: number }> {
  // Early return if not in browser environment
  if (typeof window === "undefined") {
    return { migrated: 0, failed: 0 };
  }

  try {
    // Check if vtierlists key exists in localStorage
    const tierListsData = localStorage.getItem("vtierlists");

    // If key doesn't exist or is empty, skip migration
    if (!tierListsData || tierListsData.trim() === "") {
      return { migrated: 0, failed: 0 };
    }

    // Parse the JSON data
    let tierLists: Array<{
      id?: string;
      name: string;
      tiers: any;
      isPublic?: boolean;
      timestamp?: string;
    }>;
    try {
      tierLists = JSON.parse(tierListsData);
    } catch (parseError) {
      console.error("Failed to parse vtierlists from localStorage:", parseError);
      // If parsing fails, clear the invalid data
      localStorage.removeItem("vtierlists");
      return { migrated: 0, failed: 0 };
    }

    // Validate that it's an array and not empty
    if (!Array.isArray(tierLists) || tierLists.length === 0) {
      // If empty array, clear it and return
      localStorage.removeItem("vtierlists");
      return { migrated: 0, failed: 0 };
    }

    // Filter out invalid tier lists (must have name and tiers)
    const validTierLists = tierLists.filter(
      (tierList) =>
        tierList &&
        typeof tierList.name === "string" &&
        tierList.name.trim() !== "" &&
        tierList.tiers &&
        typeof tierList.tiers === "object"
    );

    if (validTierLists.length === 0) {
      // No valid tier lists, clear localStorage
      localStorage.removeItem("vtierlists");
      return { migrated: 0, failed: 0 };
    }

    console.log(`[Migration] Found ${validTierLists.length} tier list(s) in localStorage to migrate`);

    // Migrate each tier list using Promise.allSettled to handle failures gracefully
    const migrationResults = await Promise.allSettled(
      validTierLists.map(async (tierList) => {
        try {
          const response = await fetch("/api/tier-lists", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: tierList.name.trim(),
              tiers: tierList.tiers,
              isPublic: tierList.isPublic || false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `HTTP ${response.status}`;

            // If tier list with same name already exists, treat as non-fatal (already migrated)
            if (response.status === 400 && errorMessage.includes("already exists")) {
              console.log(`[Migration] Tier list "${tierList.name}" already exists, skipping`);
              return { status: "skipped" as const, tierList: tierList.name };
            }

            throw new Error(`Failed to migrate tier list "${tierList.name}": ${errorMessage}`);
          }

          const migratedTierList = await response.json();
          console.log(`[Migration] Successfully migrated tier list: "${tierList.name}"`);
          return { status: "success" as const, tierList: tierList.name };
        } catch (error) {
          console.error(`[Migration] Error migrating tier list "${tierList.name}":`, error);
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
        // Skipped items don't count as migrated or failed
      } else {
        failed++;
      }
    });

    // If all tier lists were successfully migrated (or skipped), remove localStorage key
    if (failed === 0) {
      localStorage.removeItem("vtierlists");
      console.log(`[Migration] Removed vtierlists from localStorage after successful migration`);
    } else {
      // If some failed, keep the failed ones in localStorage for retry
      // Remove successfully migrated ones
      const failedTierLists = validTierLists.filter((_, index) => {
        const result = migrationResults[index];
        return result.status === "rejected" || (result.status === "fulfilled" && result.value.status !== "success");
      });

      if (failedTierLists.length > 0) {
        localStorage.setItem("vtierlists", JSON.stringify(failedTierLists));
        console.log(`[Migration] Kept ${failedTierLists.length} failed tier list(s) in localStorage for retry`);
      } else {
        localStorage.removeItem("vtierlists");
      }
    }

    return { migrated, failed };
  } catch (error) {
    console.error("[Migration] Unexpected error during tier list migration:", error);
    return { migrated: 0, failed: 0 };
  }
}

