const express = require('express');
const https = require('https');

const router = express.Router();


// Fetch JSON from URL
function fetchJson(url, timeout) {
    if (!timeout) {
        timeout = 10000;
    }

    return new Promise(function (resolve, reject) {

        const req = https.get(url, { timeout: timeout }, function (res) {

            let raw = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                raw = raw + chunk;
            });

            res.on('end', function () {

                try {

                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        reject(
                            new Error(
                                'HTTP request failed with status ' +
                                res.statusCode
                            )
                        );
                        return;
                    }

                    const data = JSON.parse(raw);

                    resolve(data);

                } catch (err) {
                    reject(err);
                }

            });

        });


        req.on('error', function (err) {
            reject(err);
        });


        req.on('timeout', function () {
            req.destroy(
                new Error('Request timeout')
            );
        });

    });
}



// --------------------------------------------------
// AIR QUALITY ASSESSMENT
// --------------------------------------------------

router.get('/assess', async function (req, res) {

    try {

        const lat = req.query.lat;
        const lon = req.query.lon;


        // Check coordinates
        if (!lat || !lon) {

            return res.status(400).json({
                message: 'lat and lon are required'
            });

        }


        const latitude = Number(lat);
        const longitude = Number(lon);


        // Validate coordinates
        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            return res.status(400).json({
                message: 'Invalid latitude or longitude'
            });

        }


        // Open-Meteo Air Quality API
        const url =
            'https://air-quality-api.open-meteo.com/v1/air-quality' +
            '?latitude=' + latitude +
            '&longitude=' + longitude +
            '&current=pm2_5,pm10,us_aqi';


        console.log(
            'Air quality request:',
            url
        );


        // Get data
        const data = await fetchJson(url);


        console.log(
            'Open-Meteo response:',
            data
        );


        const current = data.current || {};


        // Prefer PM2.5
        let value = current.pm2_5;
        let parameter = 'pm2_5';


        // If PM2.5 is unavailable, use PM10
        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {

            value = current.pm10;
            parameter = 'pm10';

        }


        // No data available
        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {

            return res.status(404).json({
                message: 'No particulate data available for this location'
            });

        }


        value = Number(value);


        // --------------------------------------------------
        // AQI CATEGORY
        // --------------------------------------------------

        let category = 'Unknown';
        let level = 0;


        if (value <= 12) {

            category = 'Good';
            level = 1;

        } else if (value <= 35.4) {

            category = 'Moderate';
            level = 2;

        } else if (value <= 55.4) {

            category = 'Unhealthy for Sensitive Groups';
            level = 3;

        } else if (value <= 150.4) {

            category = 'Unhealthy';
            level = 4;

        } else if (value <= 250.4) {

            category = 'Very Unhealthy';
            level = 5;

        } else {

            category = 'Hazardous';
            level = 6;

        }


        // --------------------------------------------------
        // RECOMMENDATIONS
        // --------------------------------------------------

        const recommendations = [];


        if (level >= 4) {

            recommendations.push(
                'Avoid prolonged outdoor exertion; stay indoors when possible.'
            );

        }


        if (level >= 3) {

            recommendations.push(
                'Sensitive groups should reduce outdoor exposure.'
            );

        }


        if (level <= 2) {

            recommendations.push(
                'Air quality is acceptable for most people.'
            );

        }


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        return res.json({

            source: 'open-meteo',

            parameter: parameter,

            value: value,

            category: category,

            level: level,

            recommendations: recommendations,

            aqi: current.us_aqi || null,

            location: {
                latitude: latitude,
                longitude: longitude
            }

        });


    } catch (error) {

        console.error(
            'Air risk assessment failed:',
            error.message
        );


        return res.status(500).json({

            message: 'Unable to fetch air quality data',

            error: error.message

        });

    }

});


// --------------------------------------------------
// EXPORT ROUTER
// --------------------------------------------------

module.exports = router;