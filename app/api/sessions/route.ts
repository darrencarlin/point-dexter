import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
};
