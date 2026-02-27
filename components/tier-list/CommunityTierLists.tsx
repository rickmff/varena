"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Search, ArrowUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TierListCard } from "./TierListCard";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type TierKey = "S" | "A" | "B" | "C" | "D" | "Unranked";

type TierState = {
  [key in TierKey]: string[];
};

type TierList = {
  id: string;
  name: string;
  isPublic: boolean;
  tiers: TierState;
  upvotes: number;
  downvotes: number;
  userVote: "upvote" | "downvote" | null;
  createdAt: string;
  updatedAt: string;
  author: string;
  userId: string | null;
  userImage: string | null;
};

type SortOption = "popular" | "newest" | "oldest";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export function CommunityTierLists() {
  const { user } = useAuth();
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  useEffect(() => {
    fetchTierLists();
  }, []);

  const fetchTierLists = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tier-lists?public=true&limit=100");
      if (!response.ok) throw new Error("Failed to load tier lists");
      const data = await response.json();
      setTierLists(data.tierLists || []);
    } catch (error) {
      console.error("Error loading tier lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedLists = useMemo(() => {
    let filtered = [...tierLists];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.author.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tierLists, searchQuery, sortBy]);

  const handleVoteChange = (
    id: string,
    upvotes: number,
    downvotes: number,
    userVote: "upvote" | "downvote" | null
  ) => {
    setTierLists((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, upvotes, downvotes, userVote } : t
      )
    );
  };

  if (loading) {
    return (
      <div>
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[140px]" />
        </div>

        {/* Tier lists grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-black/90 via-zinc-900/80 to-black/90 border border-white/10 overflow-hidden h-full flex flex-col"
            >
              <CardContent className="p-4 relative flex flex-col flex-1">
                {/* Top right corner - Action buttons skeleton */}
                <div className="absolute top-1 right-1 flex gap-2 z-10">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>

                {/* Header skeleton */}
                <div className="flex items-start justify-between mb-4 pr-12">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                {/* Tier Preview skeleton */}
                <div className="space-y-2 mb-4 flex-1">
                  {["S", "A", "B", "C", "D"].map((tierKey, tierIndex) => (
                    <div key={tierKey} className="flex items-stretch gap-1">
                      <Skeleton className="w-8 h-8 rounded-l" />
                      <div className="flex-1 min-h-[32px] rounded-r border border-white/10 bg-black/40 px-1.5 py-1 flex flex-wrap gap-1 items-center">
                        {Array.from({ length: (tierIndex % 3) + 2 }).map(
                          (_, i) => (
                            <Skeleton key={i} className="w-6 h-6 rounded" />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tier lists or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/20 text-white bg-black/50 hover:bg-white/10 min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>
                  {sortBy === "popular"
                    ? "Most Popular"
                    : sortBy === "newest"
                      ? "Newest"
                      : "Oldest"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-900 border-white/10">
            <DropdownMenuItem
              onClick={() => setSortBy("popular")}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              Most Popular
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("newest")}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("oldest")}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              Oldest
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredAndSortedLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? "No Results Found" : "No Public Tier Lists"}
          </h3>
          <p className="text-gray-400 max-w-sm">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Be the first to share your spell tier list with the community!"}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedLists.map((tierList) => (
            <motion.div key={tierList.id} variants={scaleIn} className="h-full">
              <Link href={`/tier-list/${tierList.id}`} className="h-full block">
                <TierListCard
                  id={tierList.id}
                  name={tierList.name}
                  tiers={tierList.tiers}
                  author={tierList.author}
                  userId={tierList.userId}
                  isPublic={tierList.isPublic}
                  upvotes={tierList.upvotes}
                  downvotes={tierList.downvotes}
                  userVote={tierList.userVote}
                  onVoteChange={
                    user?.id !== tierList.userId
                      ? (upvotes, downvotes, userVote) =>
                          handleVoteChange(tierList.id, upvotes, downvotes, userVote)
                      : undefined
                  }
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

