import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/better-auth/server";
import prisma from "@/lib/prisma";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_ID_REGEX = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Validate required OpenID params
  if (params["openid.mode"] !== "id_res" || !params["openid.claimed_id"]) {
    return NextResponse.redirect(
      new URL("/profile?steam=error&reason=cancelled", req.url)
    );
  }

  // Verify the OpenID response with Steam
  const verifyParams = new URLSearchParams(params);
  verifyParams.set("openid.mode", "check_authentication");

  let verifyResponse: Response;
  try {
    verifyResponse = await fetch(STEAM_OPENID_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });
  } catch {
    return NextResponse.redirect(
      new URL("/profile?steam=error&reason=verify_failed", req.url)
    );
  }

  const verifyText = await verifyResponse.text();
  if (!verifyText.includes("is_valid:true")) {
    return NextResponse.redirect(
      new URL("/profile?steam=error&reason=invalid", req.url)
    );
  }

  // Extract SteamID64 from claimed_id
  const match = STEAM_ID_REGEX.exec(params["openid.claimed_id"]);
  if (!match) {
    return NextResponse.redirect(
      new URL("/profile?steam=error&reason=invalid_id", req.url)
    );
  }

  const steamId = match[1];

  // Check if this Steam account is already linked to another user
  const existingLink = await prisma.user.findUnique({
    where: { steamId },
    select: { id: true },
  });

  if (existingLink && existingLink.id !== session.user.id) {
    return NextResponse.redirect(
      new URL("/profile?steam=error&reason=already_linked", req.url)
    );
  }

  // Save steamId to user
  await prisma.user.update({
    where: { id: session.user.id },
    data: { steamId },
  });

  return NextResponse.redirect(new URL("/profile?steam=success", req.url));
}
