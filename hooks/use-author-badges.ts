import { useEffect, useState } from "react";

export type UserBadgeType = {
  id: string;
  userId: string;
  badgeType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export function useUserBadges(userIds: (string | null | undefined)[]) {
  const [badges, setBadges] = useState<Record<string, UserBadgeType>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter out null/undefined userIds
    const validUserIds = userIds.filter((id): id is string => Boolean(id));

    if (validUserIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      try {
        const userIdsParam = validUserIds.join(",");
        const response = await fetch(`/api/badges?userIds=${encodeURIComponent(userIdsParam)}`);

        if (response.ok) {
          const data = await response.json();
          const badgesMap: Record<string, UserBadgeType> = {};
          (data.badges || []).forEach((badge: UserBadgeType) => {
            badgesMap[badge.userId] = badge;
          });
          setBadges(badgesMap);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userIds.join(",")]);

  return { badges, loading };
}

// Keep old hook name for backward compatibility during migration
export const useAuthorBadges = useUserBadges;

