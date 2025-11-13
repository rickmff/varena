import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/better-auth/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/better-auth/client";
import LogoutButton from "./logout-button";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information Card */}
        <Card className="bg-black/50 border-[#5865F2]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <Avatar className="h-24 w-24 border-2 border-[#5865F2]">
                <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                <AvatarFallback className="bg-[#0f0a47] text-white text-2xl font-semibold">
                  {getUserInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Name</label>
                <p className="text-white mt-1">{user.name || "Not provided"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-white mt-1">{user.email}</p>
              </div>

              {user.emailVerified && (
                <div>
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account created on
                  </label>
                  <p className="text-white mt-1">{formatDate(user.emailVerified)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="bg-black/50 border-[#5865F2]/30">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your account and builds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="outline" className="w-full justify-start bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white">
              <Link href="/builds" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                View My Builds
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start bg-[#0f0a47] hover:bg-[#4752C4] border-[#5865F2] text-white">
              <Link href="/builds/create" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Create New Build
              </Link>
            </Button>

            <div className="pt-4 border-t border-[#5865F2]/30">
              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

