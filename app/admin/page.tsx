import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath } from "../chatgpt-auth";
import { AdminStudio } from "../../components/admin-studio";
import { getAdmin } from "../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner studio — Zavier Rodrigues", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await getAdmin();
  if (admin.ok) {
    return <><AdminStudio displayName={admin.user.displayName} /><a className="studio-signout" href={chatGPTSignOutPath("/")}>Sign out</a></>;
  }

  return (
    <main className="admin-gate">
      <Link className="brand" href="/"><span className="brand-mark">ZR</span><span>Zavier Rodrigues</span></Link>
      <section>
        <p className="eyebrow">Private owner area</p>
        <h1>{admin.reason === "not-owner" ? "This studio belongs to Zavier." : admin.reason === "not-configured" ? "One last setup step." : "Welcome to your writing studio."}</h1>
        <p>{admin.reason === "not-owner" ? "You’re signed in, but this account is not on the owner allowlist." : admin.reason === "not-configured" ? "Set ADMIN_EMAIL to the email attached to your ChatGPT account before opening the studio." : "Sign in to write, preview, and publish poetry and project stories. The studio never appears in public navigation."}</p>
        {admin.reason === "signed-out" ? <a className="primary-button" href={chatGPTSignInPath("/admin")}>Sign in with ChatGPT <span aria-hidden="true">→</span></a> : null}
        <Link className="text-link" href="/">Return to the public site</Link>
      </section>
    </main>
  );
}
