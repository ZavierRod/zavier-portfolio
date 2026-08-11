export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">Make something meaningful</p>
        <h2>Have a thoughtful problem to solve?</h2>
      </div>
      <div className="footer-links">
        <span title="Add a verified public email before launch">Email soon</span>
        <a href="https://github.com/ZavierRod">GitHub <span aria-hidden="true">↗</span></a>
        <span title="Add your LinkedIn URL before launch">LinkedIn soon</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Zavier Rodrigues</span>
        <span>Built with care in California</span>
      </div>
    </footer>
  );
}
