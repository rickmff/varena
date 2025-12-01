"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Trash2, UserX, UserCheck, Loader2, Award, X, ChevronDown, Sword, Crown, Check } from "lucide-react";
import { AuthorBadge } from "@/components/AuthorBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  banned: boolean;
  _count: {
    builds: number;
    votes: number;
  };
};

type Build = {
  id: string;
  name: string;
  description: string | null;
  author: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userId: string | null;
};

type UserBadgeType = {
  id: string;
  userId: string;
  badgeType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

// Badge type definitions
const BADGE_TYPES = {
  veteran: {
    label: "Veteran",
    description: "Veteran player recognized by V Arena staff",
    color: "blue",
  },
  champion: {
    label: "Arena Champion",
    description: "Arena Champion recognized by V Arena staff",
    color: "yellow",
  },
  verified: {
    label: "Verified",
    description: "Verified by V Arena staff",
    color: "green",
  },
} as const;

type BadgeTypeKey = keyof typeof BADGE_TYPES;

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [badges, setBadges] = useState<Record<string, UserBadgeType>>({});
  const [loading, setLoading] = useState(true);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchBuilds();
      fetchBadges();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuilds = async () => {
    setBuildsLoading(true);
    try {
      const response = await fetch("/api/public-builds?sort=newest");
      if (!response.ok) {
        throw new Error("Failed to fetch builds");
      }
      const data = await response.json();
      setBuilds(data.builds || []);
    } catch (error) {
      console.error("Error fetching builds:", error);
      toast.error("Failed to load builds");
    } finally {
      setBuildsLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/admin/badges");
      if (!response.ok) {
        throw new Error("Failed to fetch badges");
      }
      const data = await response.json();
      // Convert array to object keyed by userId for easy lookup
      const badgesMap: Record<string, UserBadgeType> = {};
      (data.badges || []).forEach((badge: UserBadgeType) => {
        badgesMap[badge.userId] = badge;
      });
      setBadges(badgesMap);
    } catch (error) {
      console.error("Error fetching badges:", error);
      // Don't show error toast for badges, it's not critical
    }
  };

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );
    if (!confirmed) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          banned: !currentlyBanned,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      toast.success(`User ${action}ned successfully`);
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to DELETE user ${userEmail}? This will also delete all their builds and votes. This action cannot be undone.`
    );
    if (!confirmed) return;

    // Double confirmation for destructive action
    const doubleConfirmed = window.confirm(
      "This is your final warning. Are you absolutely sure?"
    );
    if (!doubleConfirmed) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBuild = async (buildId: string, buildName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to DELETE build "${buildName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(buildId);
    try {
      const response = await fetch(`/api/admin/builds/${buildId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete build");
      }

      setBuilds((prev) => prev.filter((build) => build.id !== buildId));
      toast.success("Build deleted successfully");
    } catch (error) {
      console.error("Error deleting build:", error);
      toast.error("Failed to delete build");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignBadge = async (userId: string, userEmail: string, badgeType: BadgeTypeKey) => {
    const badgeInfo = BADGE_TYPES[badgeType];
    const confirmed = window.confirm(
      `Are you sure you want to assign the "${badgeInfo.label}" badge to user "${userEmail}"?`
    );
    if (!confirmed) return;

    setActionLoading(`badge-${userId}`);
    try {
      const response = await fetch("/api/admin/badges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          badgeType,
          description: badgeInfo.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign badge");
      }

      const data = await response.json();
      setBadges((prev) => ({
        ...prev,
        [userId]: data.badge,
      }));
      toast.success(`${badgeInfo.label} badge assigned successfully`);
    } catch (error) {
      console.error("Error assigning badge:", error);
      toast.error("Failed to assign badge");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveBadge = async (userId: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the badge from user "${userEmail}"?`
    );
    if (!confirmed) return;

    setActionLoading(`badge-${userId}`);
    try {
      const response = await fetch(`/api/admin/badges/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove badge");
      }

      setBadges((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      toast.success("Badge removed successfully");
    } catch (error) {
      console.error("Error removing badge:", error);
      toast.error("Failed to remove badge");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-black/50 border border-white/10">
          <TabsTrigger value="users" className="data-[state=active]:bg-red-900/50">
            Users
          </TabsTrigger>
          <TabsTrigger value="builds" className="data-[state=active]:bg-red-900/50">
            Public Builds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-black/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage all users, ban/unban accounts, and delete users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Builds</TableHead>
                        <TableHead className="text-gray-300">Votes</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="text-white font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex items-center gap-2">
                              {user.name || "-"}
                              {badges[user.id] && (
                                <AuthorBadge
                                  badgeType={badges[user.id].badgeType}
                                  description={badges[user.id].description}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user._count.builds}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user._count.votes}
                          </TableCell>
                          <TableCell>
                            {user.banned ? (
                              <Badge variant="destructive" className="bg-red-900/50">
                                Banned
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-900/50">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={actionLoading === `badge-${user.id}` || actionLoading === user.id}
                                    className={
                                      badges[user.id]
                                        ? "bg-blue-900/20 border-blue-900/50 text-blue-400 hover:bg-blue-900/30"
                                        : "bg-gray-900/20 border-gray-900/50 text-gray-400 hover:bg-gray-900/30"
                                    }
                                  >
                                    {actionLoading === `badge-${user.id}` ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Award className="w-4 h-4 mr-1" />
                                        {badges[user.id]
                                          ? BADGE_TYPES[badges[user.id].badgeType as BadgeTypeKey]?.label || badges[user.id].badgeType
                                          : "Badge"}
                                        <ChevronDown className="w-3 h-3 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/95 border-white/10">
                                  {badges[user.id] ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleRemoveBadge(user.id, user.email)}
                                        className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Remove Badge
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-white/10" />
                                    </>
                                  ) : null}
                                  {Object.entries(BADGE_TYPES).map(([key, badgeInfo]) => (
                                    <DropdownMenuItem
                                      key={key}
                                      onClick={() => handleAssignBadge(user.id, user.email, key as BadgeTypeKey)}
                                      className={`cursor-pointer ${badges[user.id]?.badgeType === key
                                        ? "bg-blue-900/30 text-blue-400"
                                        : "text-white hover:bg-white/5"
                                        }`}
                                    >
                                      <Award className="w-4 h-4 mr-2" />
                                      {badgeInfo.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBanUser(user.id, user.banned)}
                                disabled={actionLoading === user.id || actionLoading === `badge-${user.id}` || actionLoading?.startsWith("badge-")}
                                className={
                                  user.banned
                                    ? "bg-green-900/20 border-green-900/50 text-green-400 hover:bg-green-900/30"
                                    : "bg-yellow-900/20 border-yellow-900/50 text-yellow-400 hover:bg-yellow-900/30"
                                }
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : user.banned ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Unban
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4 mr-1" />
                                    Ban
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                disabled={actionLoading === user.id || actionLoading === `badge-${user.id}`}
                                className="bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/30"
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builds">
          <Card className="bg-black/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Public Builds Management</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage all public builds, delete inappropriate content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {buildsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : builds.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No public builds found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">Build Name</TableHead>
                        <TableHead className="text-gray-300">Description</TableHead>
                        <TableHead className="text-gray-300">Author</TableHead>
                        <TableHead className="text-gray-300">Upvotes</TableHead>
                        <TableHead className="text-gray-300">Downvotes</TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {builds.map((build) => {
                        const score = build.upvotes - build.downvotes;
                        return (
                          <TableRow
                            key={build.id}
                            className="border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="text-white font-medium">
                              {build.name}
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs truncate" title={build.description || undefined}>
                              {build.description || "-"}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                {build.author}
                                {build.userId && badges[build.userId] && (
                                  <AuthorBadge
                                    badgeType={badges[build.userId].badgeType}
                                    description={badges[build.userId].description}
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-green-400">
                              {build.upvotes}
                            </TableCell>
                            <TableCell className="text-red-400">
                              {build.downvotes}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={score >= 0 ? "default" : "destructive"}
                                className={
                                  score >= 0
                                    ? "bg-green-900/50"
                                    : "bg-red-900/50"
                                }
                              >
                                {score >= 0 ? "+" : ""}
                                {score}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {new Date(build.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBuild(build.id, build.name)}
                                disabled={actionLoading === build.id}
                                className="bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/30"
                              >
                                {actionLoading === build.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

