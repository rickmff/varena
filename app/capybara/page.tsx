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
import { Shield, Trash2, UserX, UserCheck, Loader2, Award, X, ChevronDown, Sword, Crown, Check, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AuthorBadge } from "@/components/AuthorBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

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
  author: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userId: string | null;
};

type TierList = {
  id: string;
  name: string;
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
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userSortField, setUserSortField] = useState<string | null>(null);
  const [userSortDirection, setUserSortDirection] = useState<"asc" | "desc">("asc");
  const [buildSortField, setBuildSortField] = useState<string | null>(null);
  const [buildSortDirection, setBuildSortDirection] = useState<"asc" | "desc">("asc");
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [tierListsLoading, setTierListsLoading] = useState(true);
  const [tierListSortField, setTierListSortField] = useState<string | null>(null);
  const [tierListSortDirection, setTierListSortDirection] = useState<"asc" | "desc">("asc");
  const [logSearch, setLogSearch] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchBuilds();
      fetchTierLists();
      fetchBadges();
      fetchLogs();
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

  const fetchTierLists = async () => {
    setTierListsLoading(true);
    try {
      const response = await fetch("/api/tier-lists?public=true&limit=200");
      if (!response.ok) {
        throw new Error("Failed to fetch tier lists");
      }
      const data = await response.json();
      setTierLists(
        (data.tierLists || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          author: t.author || "Anonymous",
          upvotes: t.upvotes,
          downvotes: t.downvotes,
          createdAt: t.createdAt,
          userId: t.userId,
        }))
      );
    } catch (error) {
      console.error("Error fetching tier lists:", error);
      toast.error("Failed to load tier lists");
    } finally {
      setTierListsLoading(false);
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

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch("/api/admin/logs?limit=200");
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleUserSort = (field: string) => {
    if (userSortField === field) {
      setUserSortDirection(userSortDirection === "asc" ? "desc" : "asc");
    } else {
      setUserSortField(field);
      setUserSortDirection("asc");
    }
  };

  const handleBuildSort = (field: string) => {
    if (buildSortField === field) {
      setBuildSortDirection(buildSortDirection === "asc" ? "desc" : "asc");
    } else {
      setBuildSortField(field);
      setBuildSortDirection("asc");
    }
  };

  const handleTierListSort = (field: string) => {
    if (tierListSortField === field) {
      setTierListSortDirection(tierListSortDirection === "asc" ? "desc" : "asc");
    } else {
      setTierListSortField(field);
      setTierListSortDirection("asc");
    }
  };

  const getSortIcon = (field: string | null, currentField: string | null, direction: "asc" | "desc") => {
    if (field !== currentField) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return direction === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!userSortField) return 0;

    let aValue: any;
    let bValue: any;

    // Handle nested objects
    if (userSortField === "_count") {
      aValue = a._count.builds + a._count.votes;
      bValue = b._count.builds + b._count.votes;
    } else if (userSortField === "votes") {
      aValue = a._count.votes;
      bValue = b._count.votes;
    } else {
      aValue = (a as any)[userSortField];
      bValue = (b as any)[userSortField];
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    // Handle dates
    if (userSortField === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle booleans
    if (typeof aValue === "boolean") {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }

    // Handle strings
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return userSortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return userSortDirection === "asc" ? 1 : -1;
    return 0;
  }).filter((user) => {
    if (!userSearch) return true;
    const searchLower = userSearch.toLowerCase();
    return (
      (user.name?.toLowerCase().includes(searchLower)) ||
      (user.email.toLowerCase().includes(searchLower))
    );
  });

  const sortedBuilds = [...builds].sort((a, b) => {
    if (!buildSortField) return 0;

    let aValue: any = (a as any)[buildSortField];
    let bValue: any = (b as any)[buildSortField];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    // Handle dates
    if (buildSortField === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle strings
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle numbers (upvotes, downvotes)
    if (typeof aValue === "number" && typeof bValue === "number") {
      // Numbers are already comparable
    }

    if (aValue < bValue) return buildSortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return buildSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const sortedTierLists = [...tierLists].sort((a, b) => {
    if (!tierListSortField) return 0;

    let aValue: any = (a as any)[tierListSortField];
    let bValue: any = (b as any)[tierListSortField];

    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";

    if (tierListSortField === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return tierListSortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return tierListSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredLogs = logs.filter((log) => {
    if (logTypeFilter !== "all" && log.type !== logTypeFilter) return false;
    if (logSearch) {
      const s = logSearch.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(s) ||
        log.userEmail?.toLowerCase().includes(s) ||
        log.details?.toLowerCase().includes(s)
      );
    }
    return true;
  });

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

  const handleDeleteTierList = async (tierListId: string, tierListName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to DELETE tier list "${tierListName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(tierListId);
    try {
      const response = await fetch(`/api/admin/tier-lists/${tierListId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tier list");
      }

      setTierLists((prev) => prev.filter((tl) => tl.id !== tierListId));
      toast.success("Tier list deleted successfully");
    } catch (error) {
      console.error("Error deleting tier list:", error);
      toast.error("Failed to delete tier list");
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
      // Refresh logs to show the badge assignment
      fetchLogs();
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
      // Refresh logs
      fetchLogs();
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
          <TabsTrigger value="tierlists" className="data-[state=active]:bg-red-900/50">
            Tier Lists
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-red-900/50">
            System Logs
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
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : sortedUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {getSortIcon("email", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {getSortIcon("name", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("_count")}
                        >
                          <div className="flex items-center">
                            Builds
                            {getSortIcon("_count", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("votes")}
                        >
                          <div className="flex items-center">
                            Votes
                            {getSortIcon("votes", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("banned")}
                        >
                          <div className="flex items-center">
                            Status
                            {getSortIcon("banned", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleUserSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Joined
                            {getSortIcon("createdAt", userSortField, userSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUsers.map((user) => (
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
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleBuildSort("name")}
                        >
                          <div className="flex items-center">
                            Build Name
                            {getSortIcon("name", buildSortField, buildSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleBuildSort("author")}
                        >
                          <div className="flex items-center">
                            Author
                            {getSortIcon("author", buildSortField, buildSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleBuildSort("upvotes")}
                        >
                          <div className="flex items-center">
                            Upvotes
                            {getSortIcon("upvotes", buildSortField, buildSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleBuildSort("downvotes")}
                        >
                          <div className="flex items-center">
                            Downvotes
                            {getSortIcon("downvotes", buildSortField, buildSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleBuildSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Created
                            {getSortIcon("createdAt", buildSortField, buildSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedBuilds.map((build) => {
                        const score = build.upvotes - build.downvotes;
                        return (
                          <TableRow
                            key={build.id}
                            className="border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="text-white font-medium">
                              {build.name}
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

        <TabsContent value="tierlists">
          <Card className="bg-black/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Tier Lists Management</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage all public tier lists, delete inappropriate content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tierListsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : tierLists.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No public tier lists found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleTierListSort("name")}
                        >
                          <div className="flex items-center">
                            Tier List Name
                            {getSortIcon("name", tierListSortField, tierListSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleTierListSort("author")}
                        >
                          <div className="flex items-center">
                            Author
                            {getSortIcon("author", tierListSortField, tierListSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleTierListSort("upvotes")}
                        >
                          <div className="flex items-center">
                            Upvotes
                            {getSortIcon("upvotes", tierListSortField, tierListSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleTierListSort("downvotes")}
                        >
                          <div className="flex items-center">
                            Downvotes
                            {getSortIcon("downvotes", tierListSortField, tierListSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300">Score</TableHead>
                        <TableHead
                          className="text-gray-300 cursor-pointer hover:text-white"
                          onClick={() => handleTierListSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Created
                            {getSortIcon("createdAt", tierListSortField, tierListSortDirection)}
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTierLists.map((tierList) => {
                        const score = tierList.upvotes - tierList.downvotes;
                        return (
                          <TableRow
                            key={tierList.id}
                            className="border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="text-white font-medium">
                              {tierList.name}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                {tierList.author}
                                {tierList.userId && badges[tierList.userId] && (
                                  <AuthorBadge
                                    badgeType={badges[tierList.userId].badgeType}
                                    description={badges[tierList.userId].description}
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-green-400">
                              {tierList.upvotes}
                            </TableCell>
                            <TableCell className="text-red-400">
                              {tierList.downvotes}
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
                              {new Date(tierList.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTierList(tierList.id, tierList.name)}
                                disabled={actionLoading === tierList.id}
                                className="bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/30"
                              >
                                {actionLoading === tierList.id ? (
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

        <TabsContent value="logs">
          <Card className="bg-black/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                System Logs
              </CardTitle>
              <CardDescription className="text-gray-400">
                View system activity: signups, logins, badges assigned, votes, and build publish/unpublish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or details..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All", color: "bg-white/10 hover:bg-white/20" },
                    { value: "signup", label: "Signup", color: "bg-purple-900/50 hover:bg-purple-900/70" },
                    { value: "login", label: "Login", color: "bg-blue-900/50 hover:bg-blue-900/70" },
                    { value: "badge", label: "Badge", color: "bg-yellow-900/50 hover:bg-yellow-900/70" },
                    { value: "vote", label: "Vote", color: "bg-green-900/50 hover:bg-green-900/70" },
                    { value: "publish", label: "Publish", color: "bg-cyan-900/50 hover:bg-cyan-900/70" },
                    { value: "unpublish", label: "Unpublish", color: "bg-orange-900/50 hover:bg-orange-900/70" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setLogTypeFilter(filter.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        logTypeFilter === filter.value
                          ? `${filter.color} text-white ring-1 ring-white/30`
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No logs found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Details</TableHead>
                        <TableHead className="text-gray-300">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell>
                            <Badge
                              className={
                                log.type === "signup"
                                  ? "bg-purple-900/50"
                                  : log.type === "login"
                                    ? "bg-blue-900/50"
                                    : log.type === "badge"
                                      ? "bg-yellow-900/50"
                                      : log.type === "vote"
                                        ? "bg-green-900/50"
                                        : log.type === "publish"
                                          ? "bg-cyan-900/50"
                                          : log.type === "unpublish"
                                            ? "bg-orange-900/50"
                                            : "bg-gray-900/50"
                              }
                            >
                              {log.type === "signup"
                                ? "Signup"
                                : log.type === "login"
                                  ? "Login"
                                  : log.type === "badge"
                                    ? "Badge"
                                    : log.type === "vote"
                                      ? "Vote"
                                      : log.type === "publish"
                                        ? "Publish"
                                        : log.type === "unpublish"
                                          ? "Unpublish"
                                          : "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {log.userName || log.userEmail || "Unknown"}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {log.details}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(log.timestamp).toLocaleString()}
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
      </Tabs>
    </div>
  );
}

