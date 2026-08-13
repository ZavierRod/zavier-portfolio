import { clearFailedLogins, createAdminSessionCookie, loginAllowed, recordFailedLogin, sameOrigin, verifyAdminPassword } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

function adminRedirect(request: Request, error?: string) {
  const url = new URL("/admin", request.url);
  if (error) url.searchParams.set("error", error);
  return url;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  if (!(await loginAllowed(request))) return new Response("Too many attempts. Try again in fifteen minutes.", { status: 429 });

  let password = "";
  try {
    const form = await request.formData();
    const value = form.get("password");
    password = typeof value === "string" ? value : "";
  } catch {
    return Response.redirect(adminRedirect(request, "invalid"), 303);
  }

  if (!(await verifyAdminPassword(password))) {
    await recordFailedLogin(request);
    return Response.redirect(adminRedirect(request, "invalid"), 303);
  }

  await clearFailedLogins(request);
  return new Response(null, {
    status: 303,
    headers: {
      Location: adminRedirect(request).toString(),
      "Set-Cookie": await createAdminSessionCookie(),
      "Cache-Control": "no-store",
    },
  });
}
