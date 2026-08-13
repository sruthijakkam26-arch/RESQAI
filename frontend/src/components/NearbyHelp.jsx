import { useState } from "react";


const TYPE_INFO = {
  hospital: {
    icon: "🏥",
    label: "Hospital",
  },
  clinic: {
    icon: "🩺",
    label: "Clinic",
  },
  pharmacy: {
    icon: "💊",
    label: "Pharmacy",
  },
  shelter: {
    icon: "🏠",
    label: "Shelter",
  },
  fire_station: {
    icon: "🚒",
    label: "Fire Station",
  },
  police: {
    icon: "👮",
    label: "Police Station",
  },
};

function getType(tags = {}) {
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "clinic") return "clinic";
  if (tags.amenity === "pharmacy") return "pharmacy";
  if (
    tags.amenity === "shelter" ||
    tags.social_facility === "shelter"
  )
    return "shelter";
  if (tags.amenity === "fire_station") return "fire_station";
  if (tags.amenity === "police") return "police";

  return "hospital";
}

function getCoordinates(element) {
  if (element.lat && element.lon) {
    return {
      lat: element.lat,
      lon: element.lon,
    };
  }

  if (element.center) {
    return {
      lat: element.center.lat,
      lon: element.center.lon,
    };
  }

  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function NearbyHelp() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState(null);

  const findNearbyPlaces = () => {
    setLoading(true);
    setError("");

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setError("Location access requires HTTPS after deployment. Open the secure (https://) version of this website.");
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Location detection is not supported by this browser. Use a current browser over HTTPS.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setLocation({ lat, lon });

          const response = await fetch(
            `/api/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=${encodeURIComponent(radius)}`
          );

          if (!response.ok) {
            const detail = await response.json().catch(() => ({}));
            throw new Error(detail.message || "Unable to load nearby facilities.");
          }

          const data = await response.json();

          const results = data.elements
            .map((element) => {
              const coordinates = getCoordinates(element);

              if (!coordinates) return null;

              const type = getType(element.tags);

              const distance = calculateDistance(
                lat,
                lon,
                coordinates.lat,
                coordinates.lon
              );

              return {
                id: element.id,
                name:
                  element.tags?.name ||
                  element.tags?.["name:en"] ||
                  TYPE_INFO[type].label,
                type,
                distance,
                lat: coordinates.lat,
                lon: coordinates.lon,
                phone:
                  element.tags?.phone ||
                  element.tags?.["contact:phone"] ||
                  "",
                address:
                  element.tags?.["addr:street"] ||
                  element.tags?.["addr:full"] ||
                  element.tags?.["addr:city"] ||
                  "Address unavailable",
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance);

          setPlaces(results);
        } catch (err) {
          console.error(err);
          setError(
            "Could not load nearby emergency facilities. Please try again."
          );
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);

        if (geoError.code === 1) {
          setError(
            "Location permission was denied. Allow location access in your browser settings, then try again."
          );
        } else if (geoError.code === 2) {
          setError("Your device location service is unavailable. Turn on Location Services and try again.");
        } else {
          setError("Location detection timed out. Make sure Wi-Fi or Location Services are enabled, then try again.");
        }
      },
      {
        // Network location is faster and more dependable on laptops than GPS-only mode.
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 300000,
      }
    );
  };

  const filteredPlaces =
    activeFilter === "all"
      ? places
      : places.filter((place) => place.type === activeFilter);

  const openDirections = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
    window.open(url, "_blank");
  };

  return (
    <section className="nearby-help-section">
      <div className="nearby-header">
        <div>
          <div className="section-badge">🆘 Emergency Assistance</div>

          <h2>Nearby Emergency Help</h2>

          <p>
            Quickly find hospitals, shelters, pharmacies, police and
            fire stations near your current location.
          </p>
        </div>

        <div className="nearby-control">
          <label>Search Radius</label>

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
          </select>

          <button
              type="button"
              className="location-button"
              onClick={findNearbyPlaces}
              disabled={loading}
            >
            {loading ? "Finding..." : "📍 Find Nearby Help"}
          </button>
        </div>
      </div>

      <div className="nearby-filters">
        <button type="button" className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>🌐 All</button>
        <button type="button" className={activeFilter === "hospital" ? "active" : ""} onClick={() => setActiveFilter("hospital")}>🏥 Hospitals</button>
        <button type="button" className={activeFilter === "shelter" ? "active" : ""} onClick={() => setActiveFilter("shelter")}>🏠 Shelters</button>
        <button type="button" className={activeFilter === "pharmacy" ? "active" : ""} onClick={() => setActiveFilter("pharmacy")}>💊 Pharmacy</button>
        <button type="button" className={activeFilter === "police" ? "active" : ""} onClick={() => setActiveFilter("police")}>👮 Police</button>
        <button type="button" className={activeFilter === "fire_station" ? "active" : ""} onClick={() => setActiveFilter("fire_station")}>🚒 Fire</button>
      </div>

      {error && (
        <div className="nearby-error">
          ⚠️ {error}
        </div>
      )}

      {location && (
        <div className="location-status">
          📍 Your location detected successfully
          <span>
            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </span>
        </div>
      )}

      {!loading && places.length === 0 && !error && (
        <div className="nearby-empty">
          <div className="empty-icon">📍</div>

          <h3>Find Emergency Facilities Near You</h3>

          <p>
            Allow location access to discover nearby hospitals,
            shelters and emergency services.
          </p>

          <button
            type="button"
            className="empty-button"
            onClick={findNearbyPlaces}
          >
            📍 Detect My Location
          </button>
        </div>
      )}

      {loading && (
        <div className="nearby-loading">
          <div className="loader"></div>

          <h3>Searching nearby facilities...</h3>

          <p>Please wait a moment.</p>
        </div>
      )}

      {!loading && filteredPlaces.length > 0 && (
        <div className="nearby-grid">
          {filteredPlaces.map((place) => {
            const info = TYPE_INFO[place.type];

            return (
              <div className="nearby-card" key={place.id}>
                <div className="place-icon">
                  {info.icon}
                </div>

                <div className="place-content">
                  <div className="place-type">
                    {info.label}
                  </div>

                  <h3>{place.name}</h3>

                  <p className="place-distance">
                    📍 {place.distance.toFixed(2)} km away
                  </p>

                  <p className="place-address">
                    {place.address}
                  </p>

                  {place.phone && (
                    <p className="place-phone">
                      📞 {place.phone}
                    </p>
                  )}

                  <div className="place-actions">
                    <button
                      type="button"
                      onClick={() => openDirections(place)}
                    >
                      🧭 Directions
                    </button>

                    {place.phone && (
                      <a href={`tel:${place.phone}`} className="call-button"   >
                        📞 Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading &&
        places.length > 0 &&
        filteredPlaces.length === 0 && (
          <div className="nearby-empty small">
            <div className="empty-icon">🔎</div>

            <h3>No facilities found</h3>

            <p>
              Try increasing the search radius or selecting
              another category.
            </p>
          </div>
        )}

      <div className="nearby-footer">
        <span>🌐 Data provided by OpenStreetMap contributors</span>
        <span>⚠️ Always verify emergency information</span>
      </div>
    </section>
  );
}
