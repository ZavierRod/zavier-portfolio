const links = [
  ["Work", "/projects"],
  ["Poetry", "/poetry"],
  ["About", "/about"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Zavier Rodrigues, home">
        <span className="brand-mark" aria-hidden="true">ZR</span>
        <span>Zavier Rodrigues</span>
      </a>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a className="nav-contact" href="https://github.com/ZavierRod">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}
