export default function ContactSection() {
  return (
    <section className="section" id="contact">
      <div className="wrap">
        <p className="subkicker">
          <span className="rule"></span>Contact
        </p>
        <div className="sectionTitleLine">
          <h2>Let's talk.</h2>
          <div className="meta">Toronto · available for collaborations</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <a className="iconLink" href="mailto:tetiana.korolyuk@gmail.com">
            <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            tetiana.korolyuk@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
