export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">TETÉ.</div>
          <p className="footer-desc">
            Interior Design Studio based in Toronto, creating exceptional spaces
            that blend elegance, comfort, and timeless design.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Navigation</h4>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#journal">Journal</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <a href="mailto:tetiana.korolyuk@gmail.com">Email Us</a>
            <a href="tel:+15555555555">Call Us</a>
            <a href="#contact">Start a Project</a>
          </div>

          <div className="footer-column">
            <h4>Follow</h4>
            <a href="#">Instagram</a>
            <a href="#">Pinterest</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 TETÉ Interior Design. All rights reserved.</span>
        <span>Toronto, Ontario</span>
      </div>
    </footer>
  );
}
