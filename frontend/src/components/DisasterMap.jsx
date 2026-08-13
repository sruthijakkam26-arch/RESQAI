import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Center map on user's location
function LocationCenter({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(
        [userLocation.latitude, userLocation.longitude],
        13,
        {
          duration: 1.5
        }
      );
    }
  }, [userLocation, map]);

  return null;
}

function DisasterMap({
  disasters = [],
  userLocation = null
}) {

  // Default location: Hyderabad
  const defaultPosition = [17.3850, 78.4867];

  const mapCenter = userLocation
    ? [
        userLocation.latitude,
        userLocation.longitude
      ]
    : defaultPosition;

  // Convert disaster data into map coordinates
  const getCoordinates = (disaster) => {

    // If backend already provides latitude/longitude
    if (
      disaster.latitude !== undefined &&
      disaster.longitude !== undefined
    ) {
      return [
        Number(disaster.latitude),
        Number(disaster.longitude)
      ];
    }

    // Common city coordinates
    const cityCoordinates = {
      hyderabad: [17.3850, 78.4867],
      delhi: [28.6139, 77.2090],
      mumbai: [19.0760, 72.8777],
      bengaluru: [12.9716, 77.5946],
      bangalore: [12.9716, 77.5946],
      chennai: [13.0827, 80.2707],
      kolkata: [22.5726, 88.3639],
      pune: [18.5204, 73.8567],
      visakhapatnam: [17.6868, 83.2185],
      vijayawada: [16.5062, 80.6480]
    };

    const location =
      String(disaster.location || "").toLowerCase();

    for (const city in cityCoordinates) {
      if (location.includes(city)) {
        return cityCoordinates[city];
      }
    }

    // Default Hyderabad
    return defaultPosition;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "450px"
      }}
    >

      <MapContainer
        center={mapCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "450px",
          borderRadius: "18px"
        }}
      >

        {/* OpenStreetMap */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Center map when user location changes */}
        <LocationCenter
          userLocation={userLocation}
        />

        {/* USER LOCATION */}
        {userLocation && (
          <CircleMarker
            center={[
              userLocation.latitude,
              userLocation.longitude
            ]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#4386ff",
              fillOpacity: 1,
              weight: 3
            }}
          >
            <Popup>
              <strong>📍 Your Location</strong>
              <br />
              Latitude:{" "}
              {userLocation.latitude.toFixed(6)}
              <br />
              Longitude:{" "}
              {userLocation.longitude.toFixed(6)}
            </Popup>
          </CircleMarker>
        )}

        {/* DISASTER MARKERS */}
        {disasters.map((disaster, index) => {

          const position = getCoordinates(disaster);

          return (
            <CircleMarker
              key={
                disaster._id ||
                disaster.id ||
                disaster.disaster_id ||
                index
              }
              center={position}
              radius={
                String(disaster.severity).toLowerCase() ===
                "critical"
                  ? 12
                  : 8
              }
              pathOptions={{
                color:
                  String(disaster.severity).toLowerCase() ===
                  "critical"
                    ? "#ff3f4a"
                    : "#ff914d",

                fillColor:
                  String(disaster.severity).toLowerCase() ===
                  "critical"
                    ? "#ff3f4a"
                    : "#ff914d",

                fillOpacity: 0.8,
                weight: 2
              }}
            >

              <Popup>

                <div
                  style={{
                    minWidth: "180px"
                  }}
                >

                  <strong>
                    🚨 {disaster.type || "Disaster"}
                  </strong>

                  <br />

                  <span>
                    📍 {disaster.location || "Unknown location"}
                  </span>

                  <br />

                  <span>
                    ⚠️ Severity:{" "}
                    {disaster.severity || "Unknown"}
                  </span>

                  <br />

                  <span>
                    Status:{" "}
                    {disaster.status || "Unknown"}
                  </span>

                </div>

              </Popup>

            </CircleMarker>
          );
        })}

      </MapContainer>

    </div>
  );
}

export default DisasterMap;
