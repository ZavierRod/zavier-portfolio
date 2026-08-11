import Link from "next/link";

const links = [
  ["Work", "/projects"],
  ["Poetry", "/poetry"],
  ["About", "/about"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Zavier Rodrigues, home">
        <span className="brand-mark" aria-hidden="true">ZR</span>
        <span>Zavier Rodrigues</span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <a className="nav-contact" href="https://github.com/ZavierRod">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}
