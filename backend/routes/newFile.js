const { pm25 } = require('./airRoutes');

res.json({ source: 'openaq', parameter: pm25 ? 'pm25' : 'pm10', value, category, recommendations, raw: { results: data.results ? data.results.length : 0 } });
