import { useState } from 'react';

export default function AirRisk() {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const assess = async (useGeo) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      let qlat = lat;
      let qlon = lon;
      if (useGeo) {
        await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition((p) => {
            qlat = p.coords.latitude.toFixed(6);
            qlon = p.coords.longitude.toFixed(6);
            res();
          }, (e) => rej(e), { enableHighAccuracy: true });
        });
      }
      if (!qlat || !qlon || !Number.isFinite(Number(qlat)) || !Number.isFinite(Number(qlon))) {
        throw new Error('Enter valid latitude and longitude values');
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      const url = `${apiBaseUrl}/api/air/assess?lat=${encodeURIComponent(qlat)}&lon=${encodeURIComponent(qlon)}`;
      console.log('AirRisk request', url);
      const r = await fetch(url);
      const ctype = r.headers.get('content-type') || '';
      let data;
      try {
        data = ctype.includes('application/json') ? await r.json() : { message: await r.text() };
      } catch {
        data = { message: 'Invalid JSON response' };
      }
      console.log('AirRisk response', r.status, data);
      if (!r.ok) throw new Error((data && data.message) ? `${data.message} (status ${r.status})` : `Assessment failed (status ${r.status})`);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="glass-section">
      <h2>Air Risk Assessment</h2>
      <p>Get an air quality risk estimate for your location.</p>

      <div className="air-risk-controls">
        <input className="bubble-input" placeholder="Latitude" value={lat} onChange={(e)=>setLat(e.target.value)} />
        <input className="bubble-input" placeholder="Longitude" value={lon} onChange={(e)=>setLon(e.target.value)} />
        <button type="button" className="location-button" onClick={()=>assess(false)} disabled={loading}>Check</button>
        <button type="button" className="location-button" onClick={()=>assess(true)} disabled={loading}>Use My Location</button>
      </div>

      {loading && <div>Assessing...</div>}
      {error && <div className="nearby-error">⚠️ {error}</div>}

      {result && (
        <div className="air-result">
          <h3>{result.category}</h3>
          <p>Parameter: {result.parameter} — Value: {result.value}</p>
          <ul>
            {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <small>Source: {result.source} (nearby records: {result.raw?.results})</small>
        </div>
      )}
    </section>
  );
}
