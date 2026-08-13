import { clearAdminSessionCookie, sameOrigin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/admin", request.url).toString(),
      "Set-Cookie": clearAdminSessionCookie(),
      "Cache-Control": "no-store",
    },
  });
}
