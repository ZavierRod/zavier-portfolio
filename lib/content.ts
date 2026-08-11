export type ContentStatus = "draft" | "published";

export type Poem = {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  writtenAt: string | null;
  publishedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: ContentStatus;
  isFeatured: boolean;
  techStack: string[];
  coverImageUrl: string | null;
  repositoryUrl: string | null;
  demoUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  isPlaceholder?: boolean;
  accent?: "blue" | "yellow" | "coral";
};

export const placeholderProjects: Project[] = [
  {
    id: "placeholder-insync",
    ownerId: "placeholder",
    title: "inSync",
    slug: "insync",
    summary:
      "An iOS music and fitness concept exploring how a soundtrack might respond to movement in real time.",
    content: `## The idea

inSync explores a simple question: what if the music in a workout could meet you exactly where you are?

## The approach

The concept brings together SwiftUI, MusicKit, and Apple Health to investigate heart-rate and cadence-aware listening experiences.

## Current status

This case study is awaiting verified screenshots, implementation details, and outcomes from Zavier before publication.`,
    status: "published",
    isFeatured: true,
    techStack: ["SwiftUI", "MusicKit", "Apple Health"],
    coverImageUrl: null,
    repositoryUrl: null,
    demoUrl: null,
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    isPlaceholder: true,
    accent: "blue",
  },
  {
    id: "placeholder-blink-pay",
    ownerId: "placeholder",
    title: "Blink Pay",
    slug: "blink-pay",
    summary:
      "A remittance-focused product shaped as a shared web, API, and mobile workspace.",
    content: `## The idea

Blink Pay is a remittance-focused product concept organized as a modern TypeScript monorepo.

## The approach

Its proposed architecture connects a Next.js web experience, NestJS services, and an Expo mobile client through pnpm and Turborepo.

## Current status

This case study is awaiting verified product details, Zavier’s precise contributions, and final links before publication.`,
    status: "published",
    isFeatured: true,
    techStack: ["Next.js", "NestJS", "Expo", "TypeScript"],
    coverImageUrl: null,
    repositoryUrl: null,
    demoUrl: null,
    displayOrder: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    isPlaceholder: true,
    accent: "yellow",
  },
  {
    id: "placeholder-agora",
    ownerId: "placeholder",
    title: "Agora",
    slug: "agora",
    summary:
      "A political education and discovery concept designed to make civic context easier to explore.",
    content: `## The idea

Agora is an early product concept focused on approachable political education and discovery.

## The approach

The proposed stack pairs Next.js and NestJS with an Expo mobile experience.

## Current status

This case study remains a clearly labeled placeholder until Zavier verifies the story, scope, and implementation.`,
    status: "published",
    isFeatured: false,
    techStack: ["Next.js", "NestJS", "Expo"],
    coverImageUrl: null,
    repositoryUrl: null,
    demoUrl: null,
    displayOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    isPlaceholder: true,
    accent: "coral",
  },
];

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
