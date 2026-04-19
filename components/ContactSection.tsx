export default function ContactSection() {
  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="contact-wrap reveal">
          <div className="contact-bg">
            <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80" alt="" />
          </div>
          <div className="contact-body">
            <div>
              <div className="smallcaps light" style={{ marginBottom: 16 }}>Get in touch</div>
              <h2>Let's discuss your future <em>space.</em></h2>
              <p>
                For private residences, styling, freelance design support, or creative collaborations — get in touch and start a conversation with Teté.
              </p>
              <div className="contact-actions">
                <a className="pill-btn" href="mailto:tetiana.korolyuk@gmail.com?subject=Interior%20Design%20Inquiry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email Teté
                </a>
                <a className="ghost-btn" href="https://wa.me/15555555555?text=Hi%20Teté,%20I%20would%20love%20to%20talk%20about%20a%20project." target="_blank" rel="noopener">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="contact-bottom">
              <span>Toronto, Canada</span>
              <a href="mailto:tetiana.korolyuk@gmail.com">tetiana.korolyuk@gmail.com</a>
              <a href="https://tekofm.substack.com/" target="_blank" rel="noopener">Substack</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
