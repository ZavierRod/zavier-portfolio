import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span>404</span><p className="eyebrow">A small detour</p><h1>This page wandered off.</h1><p>The work you’re looking for may have moved, or it may not be published yet.</p><Link className="primary-button" href="/">Return home →</Link></main>;
}
