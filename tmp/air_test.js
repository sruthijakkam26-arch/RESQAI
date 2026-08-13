(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const backend = 'http://127.0.0.1:5000';
  const coords = [
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Secunderabad', lat: 17.4399, lon: 78.4983 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
  ];

  for (const c of coords) {
    try {
      const url = `${backend}/api/air/assess?lat=${c.lat}&lon=${c.lon}`;
      console.log('\n=>', c.name, url);
      const r = await fetch(url);
      const txt = await r.text();
      console.log('status', r.status);
      try {
        console.log(JSON.stringify(JSON.parse(txt), null, 2));
      } catch (e) {
        console.log('body (raw):', txt.slice(0, 800));
      }
    } catch (e) {
      console.log('request error', e.message);
    }
  }
})();
