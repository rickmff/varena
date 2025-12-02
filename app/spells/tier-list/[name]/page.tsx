import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import { SpellTierListBoard } from "@/components/SpellTierListBoard";

interface PageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function PublicSpellTierListPage(props: PageProps) {
  const params = await props.params;
  const name = decodeURIComponent(params.name);

  const user = await prisma.user.findFirst({
    where: { name },
    select: {
      id: true,
      name: true,
    },
  });

  if (!user) {
    notFound();
  }

  const spellTierDelegate = (prisma as any).spellTierList;
  const tierList = spellTierDelegate
    ? await spellTierDelegate.findUnique({
        where: { userId: user.id },
      })
    : null;

  if (!tierList || !tierList.isPublic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {user.name}&apos;s Spell Tier List
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              This board is public. You can use it for inspiration when building your own spells.
            </p>
          </div>

          <SpellTierListBoard
            initialTiers={(tierList.tiersJson as any) || null}
            initialIsPublic={tierList.isPublic}
            readOnly={true}
            ownerName={user.name}
            shareUrl={null}
          />
        </div>
      </section>
    </div>
  );
}


