/**
 * CrisesMesh AI — Red Zone Map Screen (Task 4.2 + 4.3)
 * Leaflet.js map via HTML + WebView:
 *  - Incident marker
 *  - Signal markers
 *  - Red Zone circle
 *  - Reroute simulation (safe vs unsafe route)
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, Platform,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

// Incident location — G-10 Underpass, Islamabad
const INCIDENT_LAT = 33.6938;
const INCIDENT_LNG = 73.0652;
const AFFECTED_RADIUS_M = 1200;

const SIGNAL_POINTS = [
  { lat: 33.6938, lng: 73.0652, label: '🌊 Citizen Report', color: '#ef4444' },
  { lat: 33.6945, lng: 73.0665, label: '🌧 Weather API', color: '#f59e0b' },
  { lat: 33.6930, lng: 73.0640, label: '🚗 Traffic API', color: '#f97316' },
  { lat: 33.6950, lng: 73.0680, label: '👷 Field Officer', color: '#8b5cf6' },
  { lat: 33.6925, lng: 73.0645, label: '💧 Water Sensor', color: '#3b82f6' },
  { lat: 33.6960, lng: 73.0672, label: '📞 Emergency Call', color: '#ec4899' },
  { lat: 33.6935, lng: 73.0658, label: '🗺 Flood Map', color: '#14b8a6' },
];

// Unsafe route waypoints (through red zone)
const UNSAFE_ROUTE = [
  [33.7050, 73.0400],
  [33.7000, 73.0500],
  [33.6955, 73.0620],
  [33.6940, 73.0650],  // through flood zone
  [33.6900, 73.0680],
  [33.6850, 73.0750],
];

// Safe reroute waypoints (around red zone)
const SAFE_ROUTE = [
  [33.7050, 73.0400],
  [33.7010, 73.0480],
  [33.6980, 73.0380],  // avoids flood zone
  [33.6920, 73.0350],
  [33.6880, 73.0480],
  [33.6850, 73.0750],
];

function buildMapHTML(showReroute: boolean): string {
  const signalMarkersJS = SIGNAL_POINTS.map((s, i) => `
    L.circleMarker([${s.lat}, ${s.lng}], {
      radius: 8, color: '${s.color}', fillColor: '${s.color}',
      fillOpacity: 0.8, weight: 2
    }).addTo(map).bindPopup('<b>${s.label}</b>');
  `).join('');

  const unsafeRouteJS = showReroute ? `
    var unsafeRoute = L.polyline(${JSON.stringify(UNSAFE_ROUTE)}, {
      color: '#ef4444', weight: 4, dashArray: '8 6', opacity: 0.85
    }).addTo(map);
    unsafeRoute.bindPopup('<b>⛔ Unsafe Route</b><br>ETA: 18 min<br>Passes through flood zone');
  ` : '';

  const safeRouteJS = showReroute ? `
    var safeRoute = L.polyline(${JSON.stringify(SAFE_ROUTE)}, {
      color: '#22c55e', weight: 5, opacity: 0.9
    }).addTo(map);
    safeRoute.bindPopup('<b>✅ Safe Reroute</b><br>ETA: 22 min (+4 min)<br>Avoids flood zone');
  ` : '';

  const legendHTML = showReroute ? `
    <div id="legend">
      <div><span style="color:#ef4444">─ ─</span> Unsafe Route (18 min)</div>
      <div><span style="color:#22c55e">───</span> Safe Route (22 min)</div>
      <div><span style="color:#ef4444; font-size:18px">●</span> Red Zone</div>
    </div>
  ` : `
    <div id="legend">
      <div>🔴 Incident</div>
      <div>⭕ Red Zone (1,200m)</div>
      <div>📍 Signal Sources</div>
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    var map = L.map('map', { zoomControl: true }).setView([${INCIDENT_LAT}, ${INCIDENT_LNG}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    // Red Zone circle
    L.circle([${INCIDENT_LAT}, ${INCIDENT_LNG}], {
      radius: ${AFFECTED_RADIUS_M},
      color: '#ef4444', fillColor: '#ef4444',
      fillOpacity: 0.12, weight: 2, dashArray: '6 4'
    }).addTo(map).bindPopup('<b>🔴 Red Zone</b><br>Radius: 1,200m<br>~15,000 affected');

    // Incident marker
    var incidentIcon = L.divIcon({
      html: '<div style="font-size:28px;line-height:1">🚨</div>',
      className: '', iconAnchor: [14, 28]
    });
    L.marker([${INCIDENT_LAT}, ${INCIDENT_LNG}], { icon: incidentIcon })
      .addTo(map)
      .bindPopup('<b>🚨 Urban Flooding — Critical</b><br>G-10 Underpass<br>Priority: 95/100')
      .openPopup();

    // Signal markers
    ${signalMarkersJS}

    // Routes (if reroute mode)
    ${unsafeRouteJS}
    ${safeRouteJS}
  </script>
</body>
</html>`;
}

export default function RedZoneMapScreen({ navigation, route }: any) {
  const [showReroute, setShowReroute] = useState(false);
  const incidentId = route?.params?.incidentId || 'inc_001';

  // Use WebView if available, otherwise show fallback
  let MapComponent: any = null;
  try {
    MapComponent = require('react-native-webview').WebView;
  } catch {
    MapComponent = null;
  }

  const html = buildMapHTML(showReroute);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>🗺 Red Zone Map</Text>
          <Text style={s.headerSub}>{incidentId} • Live Threat Overlay</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Toggle Reroute */}
      <View style={s.toggleRow}>
        <TouchableOpacity
          style={[s.toggleBtn, !showReroute && s.toggleActive]}
          onPress={() => setShowReroute(false)}
        >
          <Text style={[s.toggleText, !showReroute && s.toggleTextActive]}>Red Zone</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, showReroute && s.toggleActive]}
          onPress={() => setShowReroute(true)}
        >
          <Text style={[s.toggleText, showReroute && s.toggleTextActive]}>Reroute Sim</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={s.mapContainer}>
        {MapComponent ? (
          <MapComponent
            source={{ html }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
          />
        ) : (
          <View style={s.mapFallback}>
            <Text style={s.mapFallbackIcon}>🗺</Text>
            <Text style={s.mapFallbackTitle}>Interactive Map</Text>
            <Text style={s.mapFallbackSub}>
              G-10 Underpass, Islamabad{'\n'}
              Red Zone: 1,200m radius{'\n'}
              ~15,000 residents affected{'\n'}
              7 signal sources active
            </Text>
            {showReroute && (
              <View style={s.rerouteInfo}>
                <Text style={s.rerouteTitle}>🔄 Reroute Simulation</Text>
                <View style={s.rerouteRow}>
                  <Text style={s.rerouteLabel}>⛔ Unsafe Route:</Text>
                  <Text style={s.rerouteValue}>18 min (through Red Zone)</Text>
                </View>
                <View style={s.rerouteRow}>
                  <Text style={s.rerouteLabel}>✅ Safe Route:</Text>
                  <Text style={s.rerouteValue}>22 min (+4 min saved)</Text>
                </View>
                <View style={s.rerouteRow}>
                  <Text style={s.rerouteLabel}>🚗 Congestion Impact:</Text>
                  <Text style={s.rerouteValue}>+12% on alternate roads</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Stats Bar */}
      <View style={s.statsBar}>
        <StatPill icon="📍" label="Signals" value="7" />
        <StatPill icon="🔴" label="Radius" value="1.2km" />
        <StatPill icon="👥" label="Affected" value="~15K" />
        <StatPill icon="⚡" label="Priority" value="95/100" />
      </View>
    </View>
  );
}

function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillIcon}>{icon}</Text>
      <Text style={s.pillValue}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.govBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 52, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,255,210,0.12)',
  },
  backBtn: { width: 60 },
  backText: { color: Colors.govAccent, fontSize: Typography.sizes.sm, fontWeight: '600' },
  headerTitle: { color: Colors.govText, fontSize: Typography.sizes.lg, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: Colors.govTextSecondary, fontSize: Typography.sizes.xs, textAlign: 'center', marginTop: 2 },
  toggleRow: {
    flexDirection: 'row', margin: Spacing.md, marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3,
  },
  toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: Colors.govAccent },
  toggleText: { color: Colors.govTextSecondary, fontWeight: '600', fontSize: Typography.sizes.sm },
  toggleTextActive: { color: '#000' },
  mapContainer: { flex: 1, margin: Spacing.md, marginTop: Spacing.sm, borderRadius: 16, overflow: 'hidden', minHeight: 350 },
  mapFallback: {
    flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.lg, borderRadius: 16,
  },
  mapFallbackIcon: { fontSize: 64, marginBottom: 12 },
  mapFallbackTitle: { color: Colors.govText, fontSize: Typography.sizes.xl, fontWeight: '800', marginBottom: 8 },
  mapFallbackSub: { color: Colors.govTextSecondary, fontSize: Typography.sizes.md, textAlign: 'center', lineHeight: 26 },
  rerouteInfo: {
    marginTop: 20, width: '100%', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: Spacing.md,
  },
  rerouteTitle: { color: Colors.govAccent, fontWeight: '700', fontSize: Typography.sizes.md, marginBottom: 10 },
  rerouteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rerouteLabel: { color: Colors.govTextSecondary, fontSize: Typography.sizes.sm },
  rerouteValue: { color: Colors.govText, fontSize: Typography.sizes.sm, fontWeight: '600' },
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: 'rgba(0,255,210,0.05)', borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,210,0.12)', paddingVertical: Spacing.sm,
  },
  pill: { alignItems: 'center' },
  pillIcon: { fontSize: 18 },
  pillValue: { color: Colors.govAccent, fontSize: Typography.sizes.md, fontWeight: '800', marginTop: 2 },
  pillLabel: { color: Colors.govTextSecondary, fontSize: 10, marginTop: 1 },
});
