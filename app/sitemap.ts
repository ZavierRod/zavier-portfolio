import type { MetadataRoute } from "next";
import { getPublicPoems, getPublicProjects } from "../db/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [poems, projects] = await Promise.all([getPublicPoems(), getPublicProjects()]);
  const core = ["", "/projects", "/poetry", "/about"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : .8 }));
  return [
    ...core,
    ...projects.filter((item) => !item.isPlaceholder).map((item) => ({ url: `${base}/projects/${item.slug}`, lastModified: new Date(item.updatedAt), changeFrequency: "monthly" as const, priority: .7 })),
    ...poems.map((item) => ({ url: `${base}/poetry/${item.slug}`, lastModified: new Date(item.updatedAt), changeFrequency: "yearly" as const, priority: .6 })),
  ];
}
