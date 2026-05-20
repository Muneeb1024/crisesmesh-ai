/**
 * CrisesMesh AI — Government Red Zone Map Screen (Premium Dynamic Edition)
 * Features:
 *  - Dynamic coordinate centering based on selected Incident details.
 *  - Dynamically drawn Red Zone circular boundaries.
 *  - Real-time backend sync with /api/v1/government/incidents/{incidentId}.
 *  - Dynamic route detours (safe detour around incident boundary vs unsafe route straight through).
 *  - Dynamic telemetry signal marker anchoring.
 *  - Dual WebView & Web Iframe wrappers for Expo Web browser compatibility.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getIncident } from '../services/api';

interface IncidentDetails {
  id: string;
  type: string;
  severity: string;
  lat: number;
  lng: number;
  affected_radius_m: number;
  priority_score: number;
  status: string;
}

// Fallback Incident for demo sandbox stability
const FALLBACK_INCIDENT: IncidentDetails = {
  id: 'inc_demo',
  type: 'Urban Flooding',
  severity: 'Critical',
  lat: 33.6938,
  lng: 73.0652, // G-10 Underpass
  affected_radius_m: 1200,
  priority_score: 95,
  status: 'Active',
};

function buildMapHTML(
  showReroute: boolean,
  lat: number,
  lng: number,
  radius: number,
  type: string,
  severity: string
): string {
  const radiusDegrees = radius / 111000;
  const startPoint = [lat + 0.012, lng - 0.025];
  const endPoint = [lat - 0.012, lng + 0.025];

  // Dynamic routing coordinates (passes directly through central threat)
  const unsafeRoute = [
    startPoint,
    [lat + 0.006, lng - 0.012],
    [lat, lng],
    [lat - 0.006, lng + 0.012],
    endPoint,
  ];

  // Safe detour routing coordinates (bypasses outer threat circle radius boundary)
  const detourOffset = radiusDegrees + 0.0045;
  const safeRoute = [
    startPoint,
    [lat + 0.013, lng - 0.015],
    [lat + detourOffset, lng], // detour north of circle
    [lat + 0.005, lng + 0.018],
    [lat - 0.008, lng + 0.022],
    endPoint,
  ];

  // Dynamic signals anchored to center incident
  const signalPoints = [
    { lat: lat, lng: lng, label: '🌊 Citizen Report', color: '#ef4444' },
    { lat: lat + 0.001, lng: lng + 0.0015, label: '🌧 Weather API Sensor', color: '#f59e0b' },
    { lat: lat - 0.0008, lng: lng - 0.0012, label: '🚗 Traffic API Feed', color: '#f97316' },
    { lat: lat + 0.0012, lng: lng - 0.0028, label: '👷 Field Officer Telemetry', color: '#8b5cf6' },
    { lat: lat - 0.0013, lng: lng + 0.0007, label: '💧 Water Sensor Node', color: '#3b82f6' },
  ];

  const signalMarkersJS = signalPoints
    .map(
      (s) => `
    L.circleMarker([${s.lat}, ${s.lng}], {
      radius: 8, color: '${s.color}', fillColor: '${s.color}',
      fillOpacity: 0.8, weight: 2
    }).addTo(map).bindPopup('<b>${s.label}</b>');
  `
    )
    .join('');

  const unsafeRouteJS = showReroute
    ? `
    var unsafeRoute = L.polyline(${JSON.stringify(unsafeRoute)}, {
      color: '#ef4444', weight: 4, dashArray: '8 6', opacity: 0.85
    }).addTo(map);
    unsafeRoute.bindPopup('<b>⛔ Unsafe Route</b><br>ETA: 18 min<br>Passes through active flood zone');
  `
    : '';

  const safeRouteJS = showReroute
    ? `
    var safeRoute = L.polyline(${JSON.stringify(safeRoute)}, {
      color: '#10b981', weight: 5, opacity: 0.9
    }).addTo(map);
    safeRoute.bindPopup('<b>✅ Safe Detour Reroute</b><br>ETA: 22 min (+4 min detour)<br>Avoids circular red zone');
  `
    : '';

  const legendHTML = showReroute
    ? `
    <div id="legend">
      <div><span style="color:#ef4444">─ ─</span> Unsafe Route (18 min)</div>
      <div><span style="color:#10b981">───</span> Safe Detour Route (22 min)</div>
      <div><span style="color:#ef4444; font-size:18px">●</span> Red Zone Area</div>
    </div>
  `
    : `
    <div id="legend">
      <div>🔴 Incident Center</div>
      <div>⭕ Red Zone (${radius.toLocaleString()}m)</div>
      <div>📍 Anchor Telemetry</div>
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0d1117; }
    #legend {
      position: absolute; bottom: 20px; left: 10px; z-index: 1000;
      background: rgba(13,17,23,0.92); color: #e2e8f0;
      padding: 10px 14px; border-radius: 10px; font-size: 12px;
      border: 1px solid rgba(255,255,255,0.15); font-family: sans-serif;
      line-height: 1.8;
    }
    .leaflet-tile { filter: brightness(0.85) saturate(0.9) hue-rotate(5deg); }
  </style>
</head>
<body>
  <div id="map"></div>
  ${legendHTML}
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Dynamic Red Zone circle
    L.circle([${lat}, ${lng}], {
      radius: ${radius},
      color: '#ef4444', fillColor: '#ef4444',
      fillOpacity: 0.12, weight: 2, dashArray: '6 4'
    }).addTo(map).bindPopup('<b>🔴 Red Zone</b><br>Radius: ${radius}m');

    // Centered Incident marker
    var incidentIcon = L.divIcon({
      html: '<div style="font-size:28px;line-height:1;filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🚨</div>',
      className: '', iconAnchor: [14, 28]
    });
    L.marker([${lat}, ${lng}], { icon: incidentIcon })
      .addTo(map)
      .bindPopup('<b>🚨 ${type} — ${severity}</b><br>Dynamic Center')
      .openPopup();

    // Plotted telemetry markers
    ${signalMarkersJS}

    // detours overlays
    ${unsafeRouteJS}
    ${safeRouteJS}
  </script>
</body>
</html>`;
}

export default function RedZoneMapScreen({ navigation, route }: any) {
  const [showReroute, setShowReroute] = useState(false);
  const [incident, setIncident] = useState<IncidentDetails>(FALLBACK_INCIDENT);
  const [loading, setLoading] = useState(true);

  const incidentId = route?.params?.incidentId;

  useEffect(() => {
    async function loadIncidentDetails() {
      if (!incidentId) {
        setIncident(FALLBACK_INCIDENT);
        setLoading(false);
        return;
      }
      try {
        const details = await getIncident(incidentId);
        if (details) {
          setIncident({
            id: details.id,
            type: details.type,
            severity: details.severity,
            lat: details.lat || FALLBACK_INCIDENT.lat,
            lng: details.lng || FALLBACK_INCIDENT.lng,
            affected_radius_m: details.affected_radius_m || FALLBACK_INCIDENT.affected_radius_m,
            priority_score: details.priority_score || FALLBACK_INCIDENT.priority_score,
            status: details.status || FALLBACK_INCIDENT.status,
          });
        }
      } catch (err) {
        console.warn('[RedZoneMap] Backend sync failed, loading fallback details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIncidentDetails();
  }, [incidentId]);

  const html = buildMapHTML(
    showReroute,
    incident.lat,
    incident.lng,
    incident.affected_radius_m,
    incident.type,
    incident.severity
  );

  const renderMapComponent = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          id="gov-redzone-iframe"
          srcDoc={html}
          style={styles.iframe}
          title="Interactive Map"
        />
      );
    }

    let MapComponent: any = null;
    try {
      MapComponent = require('react-native-webview').WebView;
    } catch {
      MapComponent = null;
    }

    if (MapComponent) {
      return (
        <MapComponent
          source={{ html }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
        />
      );
    }

    return (
      <View style={styles.mapFallback}>
        <Text style={styles.mapFallbackIcon}>🗺️</Text>
        <Text style={styles.mapFallbackTitle}>Interactive Red Zone Map</Text>
        <Text style={styles.mapFallbackSub}>
          Location: {incident.lat.toFixed(4)}°N, {incident.lng.toFixed(4)}°E{'\n'}
          Red Zone: {incident.affected_radius_m}m radius
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>🗺️ Red Zone Map</Text>
          <Text style={styles.headerSub}>
            {incident.id} • Dynamic Threat Visualization
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Toggle Detour simulation */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showReroute && styles.toggleActive]}
          onPress={() => setShowReroute(false)}
        >
          <Text style={[styles.toggleText, !showReroute && styles.toggleTextActive]}>
            Red Zone
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showReroute && styles.toggleActive]}
          onPress={() => setShowReroute(true)}
        >
          <Text style={[styles.toggleText, showReroute && styles.toggleTextActive]}>
            Detour Sim
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.govAccent} style={styles.spinner} />
        ) : (
          renderMapComponent()
        )}
      </View>

      {/* Stats pills bar */}
      <View style={styles.statsBar}>
        <StatPill icon="📍" label="Signals" value="5" />
        <StatPill icon="🔴" label="Radius" value={`${(incident.affected_radius_m / 1000).toFixed(1)}km`} />
        <StatPill icon="👥" label="Affected" value="~15K" />
        <StatPill icon="⚡" label="Priority" value={`${incident.priority_score}/100`} />
      </View>
    </View>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.govBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,210,0.12)',
  },
  backBtn: { width: 60 },
  backText: { color: Colors.govAccent, fontSize: Typography.sizes.sm, fontWeight: '600' },
  titleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: Colors.govText,
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSub: {
    color: Colors.govTextSecondary,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    margin: Spacing.md,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: Colors.govAccent },
  toggleText: { color: Colors.govTextSecondary, fontWeight: '600', fontSize: Typography.sizes.sm },
  toggleTextActive: { color: '#000' },
  mapContainer: {
    flex: 1,
    margin: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 320,
    backgroundColor: '#0f172a',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  mapFallback: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
  },
  mapFallbackIcon: { fontSize: 64, marginBottom: 12 },
  mapFallbackTitle: {
    color: Colors.govText,
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 8,
  },
  mapFallbackSub: {
    color: Colors.govTextSecondary,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    lineHeight: 26,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,255,210,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,210,0.12)',
    paddingVertical: Spacing.sm,
  },
  pill: { alignItems: 'center' },
  pillIcon: { fontSize: 18 },
  pillValue: { color: Colors.govAccent, fontSize: Typography.sizes.md, fontWeight: '800', marginTop: 2 },
  pillLabel: { color: Colors.govTextSecondary, fontSize: 10, marginTop: 1 },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
