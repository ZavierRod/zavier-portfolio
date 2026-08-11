import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const origin = host && /^[a-z0-9.:[\]-]+$/i.test(host) ? `${protocol}://${host}` : fallback;
  const socialImage = new URL("/og.png", origin).toString();
  return {
    metadataBase: new URL(origin),
    title: { default: "Zavier Rodrigues — Software Engineer & Writer", template: "%s — Zavier Rodrigues" },
    description: "The personal portfolio and poetry of Zavier Rodrigues, a software engineer studying Computer Science and Economics at UC Berkeley.",
    applicationName: "Zavier Rodrigues",
    authors: [{ name: "Zavier Rodrigues" }],
    keywords: ["Zavier Rodrigues", "software engineer", "UC Berkeley", "portfolio", "poetry"],
    openGraph: { type: "website", locale: "en_US", siteName: "Zavier Rodrigues", title: "Zavier Rodrigues — Software Engineer & Writer", description: "Thoughtful software. Human stories.", images: [{ url: socialImage, width: 1536, height: 1024, alt: "Zavier Rodrigues — Software engineer and writer" }] },
    twitter: { card: "summary_large_image", title: "Zavier Rodrigues — Software Engineer & Writer", description: "Thoughtful software. Human stories.", images: [socialImage] },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F2EFE8", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
