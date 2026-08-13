import { useCallback, useEffect, useState } from "react";
import "./App.css";
import DisasterMap from "./components/DisasterMap";
import NearbyHelp from "./components/NearbyHelp";
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AirRisk from './pages/AirRisk'
import Landing from './pages/Landing'
import Account from './pages/Account'
import { useAuth } from './AuthContext'

const API_URL = "/api/disasters";

export default function App() {
  const [disasters, setDisasters] = useState([]);
  const [form, setForm] = useState({ type: "", description: "", location: "", severity: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [showSeverityOptions, setShowSeverityOptions] = useState(false);

  const fetchDisasters = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Unable to load reports (${res.status})`);
      const data = await res.json();
      setDisasters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch disasters:", err);
      setDisasters([]);
      setMessage("⚠️ Backend not reachable");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchDisasters(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchDisasters]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location || !form.severity) {
      setMessage("⚠️ Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify({ ...form, status: "active" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setForm({ type: "", description: "", location: "", severity: "" });
      setMessage("✅ Disaster reported");
      await fetchDisasters();
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not report disaster");
    } finally {
      setLoading(false);
    }
  };

  const totalDisasters = disasters.length;
  const criticalDisasters = disasters.filter(d => (d.severity || "").toLowerCase() === "critical" || (d.severity || "").toLowerCase() === "high").length;
  const resolvedDisasters = disasters.filter(d => (d.status || "").toLowerCase() === "resolved").length;

  const scrollToSection = (id) => {
    // scroll after a short delay to allow route change
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const isLandingPage = location.pathname === "/";

  const go = (route, section) => {
    if (route) navigate(route);
    if (section) scrollToSection(section);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>RESQAI</h1>
          <p>Smart Safety & Emergency Response Dashboard</p>
        </div>

        {!isLandingPage && (
          <nav className="navigation">
            <button type="button" className="nav-btn bubble-button" onClick={() => go('/dashboard','dashboard')}>Dashboard</button>
            <button type="button" className="nav-btn bubble-button primary-nav" onClick={() => go('/dashboard','report')}>Report Disaster</button>
            <button type="button" className="nav-btn bubble-button" onClick={() => go('/dashboard','map')}>Disaster Map</button>
            <button type="button" className="nav-btn bubble-button" onClick={() => go('/dashboard','nearby')}>Nearby Help</button>
            <button type="button" className="nav-btn bubble-button" onClick={() => navigate('/air')}>Air Risk</button>
            {!auth?.user ? (
              <>
                <button type="button" className="nav-btn bubble-button" onClick={() => navigate('/login')}>Login</button>
                <button type="button" className="nav-btn bubble-button" onClick={() => navigate('/register')}>Register</button>
              </>
            ) : (
              <>
                <div className="nav-user">Hello, {auth.user.name}</div>
                <button type="button" className="nav-btn bubble-button" onClick={() => navigate('/account')}>Account</button>
                <button type="button" className="nav-btn bubble-button" onClick={() => { auth.logout(); navigate('/login'); }}>Logout</button>
              </>
            )}
          </nav>
        )}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/air" element={<AirRisk/>} />
          <Route path="/account" element={auth?.user ? <Account/> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={auth?.user ? (
            <>
              <section id="dashboard" className="dashboard">
                <h2>Dashboard</h2>
                <div className="cards">
                  <div className="card">Total: {totalDisasters}</div>
                  <div className="card">Critical: {criticalDisasters}</div>
                  <div className="card">Resolved: {resolvedDisasters}</div>
                </div>
                {message && <div className="message">{message}</div>}
              </section>

              <section id="report" className="report">
                <h2>Report Disaster</h2>
                <form onSubmit={handleSubmit} className="disaster-form">
                  <div className="form-group">
                    <span className="form-label">Type</span>
                    <button
                      type="button"
                      className={`bubble-button option-toggle ${showTypeOptions ? "active" : ""}`}
                      onClick={() => {
                        setShowTypeOptions((prev) => !prev);
                        setShowSeverityOptions(false);
                      }}
                    >
                      {form.type || "Select Type"}
                      <span className="toggle-arrow">{showTypeOptions ? "▲" : "▼"}</span>
                    </button>
                    {showTypeOptions && (
                      <div className="option-dropdown">
                        {[
                          "Flood",
                          "Earthquake",
                          "Fire",
                          "Cyclone",
                          "Landslide",
                          "Tsunami",
                          "Other",
                        ].map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`option-button ${form.type === type ? "active" : ""}`}
                            onClick={() => {
                              setForm({ ...form, type });
                              setShowTypeOptions(false);
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <span className="form-label">Severity</span>
                    <button
                      type="button"
                      className={`bubble-button option-toggle ${showSeverityOptions ? "active" : ""}`}
                      onClick={() => {
                        setShowSeverityOptions((prev) => !prev);
                        setShowTypeOptions(false);
                      }}
                    >
                      {form.severity || "Select Severity"}
                      <span className="toggle-arrow">{showSeverityOptions ? "▲" : "▼"}</span>
                    </button>
                    {showSeverityOptions && (
                      <div className="option-dropdown">
                        {["Low", "Medium", "High", "Critical"].map((severity) => (
                          <button
                            key={severity}
                            type="button"
                            className={`option-button ${form.severity === severity ? "active" : ""}`}
                            onClick={() => {
                              setForm({ ...form, severity });
                              setShowSeverityOptions(false);
                            }}
                          >
                            {severity}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <label>
                    Location
                    <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="bubble-input" />
                  </label>

                  <label>
                    Description
                    <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="bubble-textarea" />
                  </label>

                  <button type="submit" className="location-button report-btn" disabled={loading}>{loading ? "Reporting..." : "Report"}</button>
                </form>
              </section>

              <section id="map" className="map-section">
                <h2>Disaster Map</h2>
                <DisasterMap disasters={disasters} />
              </section>

              <section id="nearby" className="nearby-section">
                <h2>Nearby Help</h2>
                <NearbyHelp />
              </section>
            </>
          ) : (
            <Navigate to="/login" replace />
          )} />

          <Route path="/" element={<Landing/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>ResQAI — Smart Disaster Management</p>
      </footer>
    </div>
  );
}
