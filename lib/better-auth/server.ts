import { auth } from "./auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader,
    },
  });
  return session;
}

