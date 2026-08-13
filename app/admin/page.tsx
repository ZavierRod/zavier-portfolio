import type { Metadata } from "next";
import { AdminStudio } from "../../components/admin-studio";
import { getAdmin } from "../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner studio — Zavier Rodrigues", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await getAdmin();
  if (admin.ok) {
    return <><AdminStudio displayName={admin.user.displayName} /><form className="studio-signout" action="/api/admin/logout" method="post"><button type="submit">Sign out</button></form></>;
  }

  const hasError = (await searchParams).error === "invalid";
  return (
    <main className="admin-gate">
      <a className="brand" href="/"><span className="brand-mark">ZR</span><span>Zavier Rodrigues</span></a>
      <section>
        <p className="eyebrow">Private owner area</p>
        <h1>{admin.reason === "not-configured" ? "One last setup step." : "Welcome to your writing studio."}</h1>
        <p>{admin.reason === "not-configured" ? "The private password has not been configured yet." : "Enter your private password to write, preview, and publish. The studio never appears in public navigation."}</p>
        {admin.reason === "signed-out" ? <form className="admin-login-form" action="/api/admin/login" method="post">
          <label htmlFor="admin-password">Private password</label>
          <input id="admin-password" name="password" type="password" required minLength={12} maxLength={256} autoComplete="current-password" aria-invalid={hasError} />
          {hasError ? <p className="admin-login-error" role="alert">That password wasn’t accepted. Please try again.</p> : null}
          <button className="primary-button" type="submit">Enter the studio <span aria-hidden="true">→</span></button>
        </form> : null}
        <a className="text-link" href="/">Return to the public site</a>
      </section>
    </main>
  );
}
