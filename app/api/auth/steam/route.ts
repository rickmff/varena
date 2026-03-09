import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/better-auth/server";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${appUrl}/api/auth/steam/callback`,
    "openid.realm": appUrl,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
}
