import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import { SpellTierListBoard } from "@/components/SpellTierListBoard";

export default async function SpellTierListPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user;

  // Evita crash caso o client Prisma ainda não tenha o modelo SpellTierList gerado
  const spellTierDelegate = (prisma as any).spellTierList;
  const tierList = spellTierDelegate
    ? await spellTierDelegate.findUnique({
      where: { userId: user.id },
    })
    : null;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof process.env.VERCEL_URL === "string"
      ? `https://${process.env.VERCEL_URL}`
      : "");

  const shareUrl =
    baseUrl && user.name
      ? `${baseUrl}/spells/tier-list/${encodeURIComponent(user.name)}`
      : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              My Spell Tier List
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Organize all spells into S–D tiers and choose if your board is
              public so other players can see it in your profile.
            </p>
          </div>

          <SpellTierListBoard
            initialTiers={(tierList?.tiersJson as any) || null}
            initialIsPublic={tierList?.isPublic ?? false}
            readOnly={false}
            ownerName={user.name || user.email || "You"}
            shareUrl={shareUrl}
          />
        </div>
      </section>
    </div>
  );
}


