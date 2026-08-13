import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [connection, setConnection] = useState("Checking connection…");

  useEffect(() => {
    let active = true;
    fetch("/api/disasters")
      .then((response) => {
        if (!response.ok) throw new Error("Service unavailable");
        if (active) setConnection("Emergency services connected");
      })
      .catch(() => {
        if (active) setConnection("Offline mode — reconnecting automatically");
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="landing-page">
      <div className="landing-hero glass-section">
        <div className="landing-copy">
          <div className="landing-badge"><span></span> Smart emergency response</div>
          <p className="landing-kicker">RESQAI</p>
          <h2>When every second matters, clarity saves lives.</h2>
          <p className="landing-description">
            Report incidents, understand local risks, and find nearby emergency support from one calm, reliable dashboard.
          </p>
          <div className="landing-actions">
            <button type="button" className="location-button landing-primary" onClick={() => navigate("/register")}>Get started</button>
            <button type="button" className="nav-btn landing-secondary" onClick={() => navigate("/login")}>I have an account</button>
          </div>
          <p className="connection-status"><i></i>{connection}</p>
        </div>

        <div className="landing-visual" aria-hidden="true">
          <div className="radar-ring ring-one"></div>
          <div className="radar-ring ring-two"></div>
          <div className="radar-ring ring-three"></div>
          <div className="radar-core">✦</div>
          <div className="signal-card signal-top">Live incident monitoring</div>
          <div className="signal-card signal-bottom">Nearby help, when you need it</div>
        </div>
      </div>

      <div className="landing-features">
        <article><span>01</span><h3>Report quickly</h3><p>Send structured incident reports in a few clear steps.</p></article>
        <article><span>02</span><h3>See the picture</h3><p>Use the disaster map to understand active reports at a glance.</p></article>
        <article><span>03</span><h3>Get help nearby</h3><p>Locate hospitals, shelters, police, pharmacies, and fire stations.</p></article>
      </div>
    </section>
  );
}
