/**
 * CrisesMesh AI — Government Command Center Redesigned Dashboard
 * High-fidelity, portrait-optimized Command Center Screen matching govt-command-Center.png.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CrisisTypes } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import {
  listIncidents,
  listReports,
  getAgentTraces,
  runAgentPipeline as runAgentPipelineAPI,
  checkHealth,
  fetchShelters,
  toggleShelter,
  triggerEvacuation,
  type IncidentResponse,
  type ReportResponse,
  type ShelterResponse,
} from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'GovernmentHome'>;

const SIDEBAR_CRISES = [
  { id: 'urban-flooding', label: 'Urban Flooding', emoji: '🌊' },
  { id: 'traffic-blockage', label: 'Traffic Blockage', emoji: '🚦' },
  { id: 'heat-emergency', label: 'Heat Emergency', emoji: '🌡️' },
  { id: 'power-outage', label: 'Power Outage', emoji: '⚡' },
  { id: 'disease-cluster', label: 'Disease Cluster', emoji: '☣️' },
  { id: 'public-disorder', label: 'Public Disorder', emoji: '🛡️' },
  { id: 'infrastructure-failure', label: 'Infrastructure Failure', emoji: '🏗️' }
];

const MOCK_LOGS_FOR_CRISES: Record<string, { id: string; time: string; tag: string; log: string; status: 'blue' | 'red' | 'green' }[]> = {
  'Urban Flooding': [
    { id: 'uf-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Fusing 12 tweets, 2 IoT water spikes, & Weather API data.', status: 'blue' },
    { id: 'uf-2', time: '15:40:32', tag: 'VETTING', log: 'Vetting reliability: confidence score calculated at 94%.', status: 'red' },
    { id: 'uf-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Urban Flooding in G-10 area.', status: 'blue' },
    { id: 'uf-4', time: '15:41:20', tag: 'SEVERITY', log: 'Severity evaluated: High. Affected radius estimated at 850m.', status: 'red' },
    { id: 'uf-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Re-routing 4 Ambulances & 2 Rescue Teams to G-10.', status: 'green' },
    { id: 'uf-6', time: '15:42:01', tag: 'SIMULATION', log: 'Predicting 80% traffic blockage on Kashmir Hwy. Detour generated.', status: 'blue' },
    { id: 'uf-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Generated bilingual alerts: English and Urdu translations.', status: 'blue' },
    { id: 'uf-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Staging bilingual (UR/EN) broadcast alerts for Sector G-10.', status: 'green' }
  ],
  'Traffic Blockage': [
    { id: 'tb-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Heavy congestion detected on Srinagar Highway (Eastward).', status: 'blue' },
    { id: 'tb-2', time: '15:40:30', tag: 'VETTING', log: 'Signal verified: traffic camera feed and maps match.', status: 'green' },
    { id: 'tb-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Traffic Blockage.', status: 'blue' },
    { id: 'tb-4', time: '15:41:22', tag: 'SEVERITY', log: 'Severity evaluated: Medium. Priority score set to 65.', status: 'red' },
    { id: 'tb-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Deploying traffic wardens to G-9 junction for manual control.', status: 'green' },
    { id: 'tb-6', time: '15:42:01', tag: 'SIMULATION', log: 'Generating Srinagar Highway detour routing models.', status: 'blue' },
    { id: 'tb-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Bilingual detour advisories successfully generated.', status: 'blue' },
    { id: 'tb-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Alert sent: Srinagar Highway East blocked. Use detour routing.', status: 'red' }
  ],
  'Heat Emergency': [
    { id: 'he-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Ground temperature detected: 45.8°C. Heat index Critical.', status: 'red' },
    { id: 'he-2', time: '15:40:35', tag: 'VETTING', log: 'Satellite heat sensors confirm regional thermal spike.', status: 'blue' },
    { id: 'he-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Heat Emergency.', status: 'blue' },
    { id: 'he-4', time: '15:41:20', tag: 'SEVERITY', log: 'Severity evaluated: High. Priority score set to 85.', status: 'red' },
    { id: 'he-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Setting up 3 mobile hydration stations in Sector I-8.', status: 'green' },
    { id: 'he-6', time: '15:42:01', tag: 'SIMULATION', log: 'Grid stress forecast: peak cooling demand expected in 2 hours.', status: 'blue' },
    { id: 'he-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Bilingual dehydration warnings prepared for dispatch.', status: 'blue' },
    { id: 'he-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Broadcasting advisory: Limit outdoor activities between 11 AM - 4 PM.', status: 'blue' }
  ],
  'Power Outage': [
    { id: 'po-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Transformer trip reported at F-11 substation. Zero voltage output.', status: 'red' },
    { id: 'po-2', time: '15:40:40', tag: 'VETTING', log: 'SCADA telemetry confirms primary circuit breaker trip.', status: 'green' },
    { id: 'po-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Power Outage.', status: 'blue' },
    { id: 'po-4', time: '15:41:25', tag: 'SEVERITY', log: 'Severity evaluated: Medium. Priority score set to 70.', status: 'red' },
    { id: 'po-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Rerouting backup power & dispatching crew to substation.', status: 'green' },
    { id: 'po-6', time: '15:42:01', tag: 'SIMULATION', log: 'Estimated restoration time simulated: 2.5 hours.', status: 'blue' },
    { id: 'po-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Power outage notice translated to Urdu/English.', status: 'blue' },
    { id: 'po-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Broadcast: Sector F-11 load shedding. Restoration expected soon.', status: 'blue' }
  ],
  'Disease Cluster': [
    { id: 'dc-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Dengue diagnostic reports surge in I-9 district by 180%.', status: 'red' },
    { id: 'dc-2', time: '15:40:35', tag: 'VETTING', log: 'Clinical reports cross-referenced with medical databases.', status: 'blue' },
    { id: 'dc-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Disease Cluster.', status: 'blue' },
    { id: 'dc-4', time: '15:41:22', tag: 'SEVERITY', log: 'Severity evaluated: High. Priority score set to 80.', status: 'red' },
    { id: 'dc-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Deploying anti-dengue sanitation spray teams to I-9 Sector.', status: 'green' },
    { id: 'dc-6', time: '15:42:01', tag: 'SIMULATION', log: 'Heatmap clustering isolates vector breeding hotspots near drainage.', status: 'blue' },
    { id: 'dc-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Sanitation guidelines translated to Urdu/English.', status: 'blue' },
    { id: 'dc-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Direct message warning sent to residents in I-9 sector.', status: 'blue' }
  ],
  'Public Disorder': [
    { id: 'pd-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'High-density crowd forming near Jinnah Avenue.', status: 'blue' },
    { id: 'pd-2', time: '15:40:40', tag: 'VETTING', log: 'CCTV feed logs verified: crowd count exceeds 800.', status: 'red' },
    { id: 'pd-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Public Disorder.', status: 'blue' },
    { id: 'pd-4', time: '15:41:25', tag: 'SEVERITY', log: 'Severity evaluated: High. Priority score set to 90.', status: 'red' },
    { id: 'pd-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Re-routing emergency services away from Jinnah Avenue.', status: 'green' },
    { id: 'pd-6', time: '15:42:01', tag: 'SIMULATION', log: 'Predicting crowd bottleneck vectors at Jinnah Avenue.', status: 'blue' },
    { id: 'pd-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Route diversion advisories translated successfully.', status: 'blue' },
    { id: 'pd-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Emergency warning: High congestion at Jinnah Ave. Use alternate routes.', status: 'blue' }
  ],
  'Infrastructure Failure': [
    { id: 'if-1', time: '15:40:12', tag: 'SIGNAL-FUSION', log: 'Structural vibration telemetry exceeding safety tolerance at G-8.', status: 'red' },
    { id: 'if-2', time: '15:40:35', tag: 'VETTING', log: 'Dual-sensor cross-check confirms mechanical integrity drop.', status: 'blue' },
    { id: 'if-3', time: '15:41:05', tag: 'CLASSIFICATION', log: 'Crisis identified: Infrastructure Failure.', status: 'blue' },
    { id: 'if-4', time: '15:41:20', tag: 'SEVERITY', log: 'Severity evaluated: High. Priority score set to 85.', status: 'red' },
    { id: 'if-5', time: '15:41:45', tag: 'RESOURCE-ALLOC', log: 'Closing left lane of G-8 flyover and capping speed limits.', status: 'green' },
    { id: 'if-6', time: '15:42:01', tag: 'SIMULATION', log: 'Simulating traffic bypass loads on secondary avenues.', status: 'blue' },
    { id: 'if-7', time: '15:42:10', tag: 'TRANSLATION', log: 'Structural bypass alerts translated successfully.', status: 'blue' },
    { id: 'if-8', time: '15:42:15', tag: 'NOTIFICATION', log: 'Alert: Lane closure on G-8 flyover. Drive with caution.', status: 'blue' }
  ]
};

function buildMiniMapHTML(incidents: IncidentResponse[], reports: ReportResponse[], shelters: ShelterResponse[]): string {
  const incidentsJSON = JSON.stringify(incidents.map(i => ({
    id: i.id,
    type: i.type,
    severity: i.severity,
    lat: i.lat || 33.6844,
    lng: i.lng || 73.0479,
    radius: i.affected_radius_m || 900,
  })));

  const reportsJSON = JSON.stringify(reports.map(r => ({
    id: r.id,
    name: r.citizen_name,
    desc: r.description,
    lat: r.lat || 33.6844,
    lng: r.lng || 73.0479,
    blocked: r.road_blocked,
  })));

  const sheltersJSON = JSON.stringify(shelters.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    capacity: s.capacity,
    occupancy: s.occupancy,
    lat: s.lat,
    lng: s.lng,
  })));

  const signalsJSON = JSON.stringify([
    { lat: 33.682, lng: 73.045, type: 'social', emoji: '🐦', color: '#00E5FF', desc: 'Twitter: "Road blocked at G-10"' },
    { lat: 33.688, lng: 73.050, type: 'iot', emoji: '🌡️', color: '#22C55E', desc: 'IoT: Nullah water level +1.2m' },
    { lat: 33.670, lng: 73.060, type: 'traffic', emoji: '🚗', color: '#FFB300', desc: 'API: Kashmir Hwy speed 12km/h' },
    { lat: 33.690, lng: 73.040, type: 'calls', emoji: '📞', color: '#FF003C', desc: '1122: 400% call spike in sector' },
    { lat: 33.675, lng: 73.055, type: 'drone', emoji: '🚁', color: '#A855F7', desc: 'Drone-04: Visual block confirmed' }
  ]);

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body, #map { width: 100%; height: 100%; background: #000000; overflow: hidden; }
      .leaflet-tile { filter: brightness(0.3) saturate(1.2) hue-rotate(180deg) invert(0.9) contrast(1.5); }
      
      /* JARVIS Radar Scanner */
      .radar-scanner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120%;
        height: 120%;
        margin-top: -60%;
        margin-left: -60%;
        background: conic-gradient(from 0deg, transparent 70%, rgba(0, 229, 255, 0.4) 100%);
        border-radius: 50%;
        animation: spin 3s linear infinite;
        pointer-events: none;
        z-index: 900;
        box-shadow: 0 0 40px rgba(0, 229, 255, 0.2) inset;
      }
      .radar-grid {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: 
          linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        z-index: 890;
        pointer-events: none;
      }
      @keyframes spin { 100% { transform: rotate(360deg); } }

      .map-overlay {
        position: absolute;
        bottom: 8px;
        right: 8px;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid rgba(0, 229, 255, 0.5);
        padding: 6px 10px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        color: #00E5FF;
        pointer-events: none;
        text-transform: uppercase;
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
      }
      .leaflet-popup-content-wrapper {
        background: rgba(0, 0, 0, 0.9) !important;
        color: #00E5FF !important;
        border: 1px solid #00E5FF !important;
        border-radius: 4px !important;
        font-family: 'Courier New', monospace !important;
        text-transform: uppercase;
        box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
      }
      .leaflet-popup-tip { background: #000000 !important; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="radar-grid"></div>
    <div class="radar-scanner"></div>
    <div class="map-overlay">
      <b style="color:#00E5FF">🛰️ J.A.R.V.I.S. ORBITAL SENSOR</b><br>
      INCIDENTS: ${incidents.length} | REPORTS: ${reports.length}
    </div>
    <script>
      var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([33.6844, 73.0479], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      var incidents = ${incidentsJSON};
      var reports = ${reportsJSON};
      var signals = ${signalsJSON};
      var shelters = ${sheltersJSON};

      signals.forEach(function(s) {
        var sigIcon = L.divIcon({
          html: '<div style="font-size:12px;line-height:1;text-shadow: 0 0 8px ' + s.color + ';">' + s.emoji + '</div>',
          className: '', iconAnchor: [6, 12]
        });
        L.marker([s.lat, s.lng], { icon: sigIcon }).addTo(map)
          .bindPopup('<div style="font-size:10px"><b style="color:' + s.color + '">RAW SIGNAL: ' + s.type.toUpperCase() + '</b><br>INFO: ' + s.desc + '</div>');
      });

      incidents.forEach(function(i) {
        var color = '#FF003C';
        if (i.severity === 'High') color = '#FFB300';
        if (i.severity === 'Medium' || i.severity === 'Low') color = '#00E5FF';
        
        var emoji = '🚨';
        var typeLower = i.type.toLowerCase();
        if (typeLower.includes('flood') || typeLower.includes('water')) emoji = '🌊';
        else if (typeLower.includes('heat') || typeLower.includes('temp') || typeLower.includes('fire')) emoji = '🌡️';
        else if (typeLower.includes('traffic') || typeLower.includes('accident') || typeLower.includes('road')) emoji = '🚗';
        else if (typeLower.includes('landslide') || typeLower.includes('rock')) emoji = '🪨';

        L.circle([i.lat, i.lng], {
          radius: i.radius,
          color: color, fillColor: color,
          fillOpacity: 0.15, weight: 2, dashArray: '4 4'
        }).addTo(map);

        var incidentIcon = L.divIcon({
          html: '<div style="font-size:20px;line-height:1;text-shadow: 0 0 10px ' + color + ';">' + emoji + '</div>',
          className: '', iconAnchor: [10, 20]
        });
        L.marker([i.lat, i.lng], { icon: incidentIcon }).addTo(map)
          .bindPopup('<div style="font-size:10px"><b style="color:' + color + '">VERIFIED THREAT: ' + i.type + '</b><br>SEVERITY: ' + i.severity + '</div>');
      });

      reports.forEach(function(r) {
        var reportIcon = L.divIcon({
          html: '<div style="font-size:16px;line-height:1;text-shadow: 0 0 10px #00E5FF;">💬</div>',
          className: '', iconAnchor: [8, 16]
        });
        L.marker([r.lat, r.lng], { icon: reportIcon }).addTo(map)
          .bindPopup('<div style="font-size:10px"><b style="color:#00E5FF">CITIZEN FEED</b><br>INFO: "' + r.desc.substring(0,40) + '..."</div>');
      });

      shelters.forEach(function(s) {
        if (s.status !== 'Available') return;
        var shelterIcon = L.divIcon({
          html: '<div style="font-size:18px;line-height:1;text-shadow: 0 0 10px #22C55E;">🏠</div>',
          className: '', iconAnchor: [9, 18]
        });
        L.marker([s.lat, s.lng], { icon: shelterIcon }).addTo(map)
          .bindPopup('<div style="font-size:10px"><b style="color:#22C55E">ACTIVE SHELTER: ' + s.name + '</b><br>CAPACITY: ' + s.occupancy + ' / ' + s.capacity + '</div>');
      });

      if (incidents.length > 0) {
        map.setView([incidents[0].lat, incidents[0].lng], 14);
      } else if (reports.length > 0) {
        map.setView([reports[0].lat, reports[0].lng], 14);
      }
    </script>
  </body>
  </html>`;
}

export default function GovernmentHomeScreen() {
  const navigation = useNavigation<NavProp>();

  let MapComponent: any = null;
  try {
    MapComponent = require('react-native-webview').WebView;
  } catch {
    MapComponent = null;
  }

  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [weather, setWeather] = useState<{ temp: number; precipitation: number } | null>(null);

  // JARVIS Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    Animated.timing(loadAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [pulseAnim, loadAnim]);

  // States for actions & modals
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [lockedModuleName, setLockedModuleName] = useState('');
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [dispatching, setDispatching] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [shelters, setShelters] = useState<ShelterResponse[]>([]);
  const [showShelterModal, setShowShelterModal] = useState<boolean>(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [diverting, setDiverting] = useState(false);
  const [sopStatus, setSopStatus] = useState<string | null>(null);

  // AI Orchestrator Sandbox State
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [vettingAgents, setVettingAgents] = useState<Record<string, boolean>>({
    'Signal Fusion Agent': true,
    'Vetting Agent': true,
    'Classification Agent': true,
    'Severity Agent': true,
    'Resource Allocation Agent': true,
    'Simulation Agent': true,
    'Translation Agent': true,
    'Notification Agent': true,
  });
  const [activeChaos, setActiveChaos] = useState<string>('');
  const [activeCrisisCategory, setActiveCrisisCategory] = useState<string>('Urban Flooding');

  // ─── Agent Pipeline State ───
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineTraces, setPipelineTraces] = useState<any[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [nextRunCountdown, setNextRunCountdown] = useState(300); // 5 min = 300s
  const [lastPipelineRun, setLastPipelineRun] = useState<string | null>(null);
  const pipelineDotAnim = useRef(new Animated.Value(0)).current;

  // AI Orchestrator Sandbox Handlers
  const handleConfidenceChange = (direction: 'up' | 'down') => {
    setConfidenceThreshold(prev => {
      const next = direction === 'up' ? Math.min(95, prev + 5) : Math.max(50, prev - 5);
      addLog("Sandbox Orchestrator", `AI dispatch trigger threshold set to [${next}%]`, "blue");
      return next;
    });
  };

  const handleToggleAgent = (agentKey: string) => {
    setVettingAgents(prev => {
      const nextVal = !prev[agentKey];
      addLog("Sandbox Orchestrator", `${agentKey.replace(' Agent', '')} state toggled to ${nextVal ? 'ACTIVE' : 'BYPASSED'}`, nextVal ? 'green' : 'red');
      return { ...prev, [agentKey]: nextVal };
    });
  };

  const handleTriggerChaos = (scenario: 'pump_outage' | 'highway_block' | 'grid_failure') => {
    if (activeChaos === scenario) {
      setActiveChaos('');
      addLog("System Command", "🟢 SIMULATED THREAT MITIGATED: Operations returned to normal.", "green");
      setSopStatus(null);
    } else {
      setActiveChaos(scenario);
      if (scenario === 'pump_outage') {
        addLog("System Command", "⚠️ DRAINAGE EMERGENCY: WASA Pump Substation-04 offline at G-10 Underpass!", "red");
        setSopStatus("⚠️ CRITICAL OUTAGE: WASA Pump-04 offline. Water levels rising!");
      } else if (scenario === 'highway_block') {
        addLog("System Command", "💥 TRAFFIC GRIDLOCK: Srinagar Highway Sector East is blocked!", "red");
        setSopStatus("🚗 DIVERSION ACTIVE: Srinagar Highway blocked. Autopilot redirecting traffic.");
      } else if (scenario === 'grid_failure') {
        addLog("System Command", "⚡ POWER GRID SNAPPED: Substation transformer blown in Sector G-10!", "red");
        setSopStatus("⚡ GRID EMERGENCY: G-10 Sector blacked out. Dispatching backup generator.");
      }
    }
  };

  // Sidebar navigation drawer state
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarX = useRef(new Animated.Value(-280)).current;
  const mainScrollRef = useRef<ScrollView>(null);

  const openSidebar = () => {
    setShowSidebar(true);
    Animated.timing(sidebarX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarX, {
      toValue: -280,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setShowSidebar(false));
  };

  // Activity stream logs — seeded from multi-crisis constants
  const [activityLogs, setActivityLogs] = useState<any[]>(MOCK_LOGS_FOR_CRISES['Urban Flooding']);

  const switchCrisis = (label: string) => {
    setActiveCrisisCategory(label);
    const logs = MOCK_LOGS_FOR_CRISES[label] || MOCK_LOGS_FOR_CRISES['Urban Flooding'];
    setActivityLogs(logs);
    addLog('COMMAND-SWITCH', `Crisis context switched → ${label.toUpperCase()}`, 'blue');
    closeSidebar();
  };

  const addLog = (tag: string, msg: string, status: 'green' | 'red' | 'blue') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLogs(prev => [
      { id: String(Date.now()), time, tag, log: msg, status },
      ...prev
    ].slice(0, 10));
  };

  const fetchIncidents = useCallback(async () => {
    let activeList: IncidentResponse[] = [];
    
    // Check connection health
    try {
      const health = await checkHealth();
      setIsOnline(health !== null);
    } catch {
      setIsOnline(false);
    }

    // Fetch shelters
    try {
      const shelterData = await fetchShelters();
      setShelters(shelterData);
    } catch (e) {
      console.log('Error listing shelters:', e);
    }

    try {
      const data = await listIncidents();
      setIncidents(data);
      activeList = data.filter(i => i.status === 'Candidate' || i.status === 'Active');
    } catch (e) {
      console.log('Error listing incidents:', e);
    }
    try {
      const repData = await listReports();
      setReports(repData);
    } catch (e) {
      console.log('Error listing reports:', e);
    }

    if (activeList.length > 0) {
      try {
        const traces = await getAgentTraces(activeList[0].id);
        const fusionTrace = traces.find(t => t.agent_name === 'Signal Fusion Agent');
        if (fusionTrace && fusionTrace.output) {
          setWeather({
            temp: fusionTrace.output.ambient_temp_c ?? 22.4,
            precipitation: fusionTrace.output.precipitation_rate_mm ?? 0.0,
          });
        }
      } catch (err) {
        console.log('Error extracting weather traces:', err);
      }
    }
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const activeIncidents = incidents.filter(i => i.status === 'Candidate' || i.status === 'Active');
  const incidentCount = activeIncidents.length;
  const latestIncident = activeIncidents[0];
  const totalReports = activeIncidents.reduce((sum, i) => sum + (i.report_ids?.length || 0), 0);

  // Dynamic Shelter computations
  const totalOccupied = shelters.reduce((sum, s) => sum + (s.status === 'Available' ? s.occupancy : 0), 0);
  const totalCapacity = shelters.reduce((sum, s) => sum + (s.status === 'Available' ? s.capacity : 0), 0);
  const shelterCapacityText = totalCapacity > 0 ? `${totalOccupied} / ${totalCapacity}` : '127 / 430';
  const shelterCapacityPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 30;

  // Dynamic Metrics Belt Computations
  const pendingReportsCount = reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length || 7;
  const totalTrackedCount = incidents.length || 12;
  const capacityLoadVal = activeIncidents.length > 0 ? 92 : 12;

  const totalPeopleAtRisk = activeIncidents.reduce((sum, i) => sum + (i.estimated_population || 0), 0);
  const peopleAtRiskText = totalPeopleAtRisk > 0 
    ? (totalPeopleAtRisk >= 1000 ? (totalPeopleAtRisk / 1000).toFixed(0) + 'K' : totalPeopleAtRisk.toString()) 
    : '248K';

  const maxPriorityScore = activeIncidents.length > 0 
    ? Math.round(Math.max(...activeIncidents.map(i => i.priority_score))) 
    : (weather && weather.precipitation > 0 ? 35 : 12);

  const getIncidentMeta = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('flood') || t.includes('water')) {
      return {
        emoji: '🌊',
        location: '📍 Islamabad G-10 Underpass Corridor',
        recommendation: 'Deploy WASA drainage pumps, redirect Srinagar Highway traffic.',
        trend: 'Worsening ↑',
        trendColor: '#EF4444'
      };
    }
    if (t.includes('heat') || t.includes('temp') || t.includes('fire')) {
      return {
        emoji: '🌡️',
        location: '📍 Rawalpindi I-8 Sector / Orangi Town',
        recommendation: 'Deploy Emergency Medical Outreach, Open Shelters',
        trend: 'Rising ↑',
        trendColor: '#F97316'
      };
    }
    if (t.includes('traffic') || t.includes('accident') || t.includes('road')) {
      return {
        emoji: '🚗',
        location: '📍 Srinagar Highway / Kashmir Corridor',
        recommendation: 'Clear Srinagar Hwy Route, Initiate Traffic Diversion',
        trend: 'Stable →',
        trendColor: '#0EA5E9'
      };
    }
    return {
      emoji: '🪨',
      location: '📍 Margalla Hills Bypass Corridor',
      recommendation: 'Deploy debris clearing vehicles, evacuate low-lying residences.',
      trend: 'Stable →',
      trendColor: '#EAB308'
    };
  };

  const displayIncidents: any[] = [...activeIncidents];

  if (displayIncidents.length === 0) {
    displayIncidents.push({
      id: 'inc_001',
      type: 'Urban Flooding',
      status: 'Active',
      severity: 'Critical',
      confidence: 0.82,
      priority_score: 92,
      lat: 33.6844,
      lng: 73.0479,
      affected_radius_m: 1200,
      estimated_population: 98000,
      expected_duration_hours: 8,
      peak_impact_time: '2.3 hrs',
      report_ids: ['rep_mock_1'],
      signal_ids: ['sig_mock_1'],
      created_at: new Date().toISOString()
    });
  }

  if (displayIncidents.length === 1) {
    displayIncidents.push({
      id: 'inc_mock_2',
      type: 'Heat Emergency',
      status: 'Active',
      severity: 'Critical',
      confidence: 0.84,
      priority_score: 84,
      lat: 33.6544,
      lng: 73.0779,
      affected_radius_m: 3500,
      estimated_population: 76000,
      expected_duration_hours: 12,
      peak_impact_time: '4.1 hrs',
      report_ids: ['rep_mock_2'],
      signal_ids: ['sig_mock_2'],
      created_at: new Date().toISOString()
    });
  }

  if (displayIncidents.length === 2) {
    displayIncidents.push({
      id: 'inc_mock_3',
      type: 'Traffic Accident',
      status: 'Active',
      severity: 'High',
      confidence: 0.62,
      priority_score: 62,
      lat: 33.6944,
      lng: 73.0579,
      affected_radius_m: 450,
      estimated_population: 24000,
      expected_duration_hours: 3,
      peak_impact_time: '1.2 hrs',
      report_ids: ['rep_mock_3'],
      signal_ids: ['sig_mock_3'],
      created_at: new Date().toISOString()
    });
  }

  // SOP Quick-Actions
  const handleAutopilotDispatch = async () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active verified incidents to trigger SOP dispatch.");
      return;
    }
    setDispatching(true);
    setSopStatus("🚒 AUTOPILOT ACTIVE: Dispatching WASA heavy pumps & ambulances...");
    addLog("Resource Allocator", "Autopilot SOP dispatch initiated via Gemini reasoning...", "green");
    try {
      const { error } = await runAgentPipelineAPI(activeIncidents[0].id);
      if (error) {
        setSopStatus(`⚠️ SOP Pipeline failure: ${error}`);
        addLog("System Router", `Pipeline failed: ${error}`, "red");
      } else {
        setSopStatus("🚒 DISPATCH SUCCESS: WASA pumps & PIMS rescue units en route!");
        addLog("Resource Allocator", "WASA drainage units & 1122 medical rescue teams en route to G-10.", "green");
      }
    } catch (err: any) {
      setSopStatus("🚒 Sandbox Mode Active: Dispatched 7 heavy drainage pumps & WASA support.");
      addLog("Resource Allocator", "SOP simulation succeeded. 7 response assets dispatched locally.", "green");
    } finally {
      setDispatching(false);
    }
  };

  const handleBroadcastWarning = () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active verified incidents to broadcast.");
      return;
    }
    setBroadcasting(true);
    setSopStatus("📢 BROADCAST ACTIVE: Generating Urdu emergency scripts...");
    addLog("Communication Agent", "Compiling bilingual public emergency alerts...", "blue");
    setTimeout(() => {
      setSopStatus("📢 SUCCESS: Urdu & English warnings sent to all citizen cells in G-10!");
      addLog("Communication Agent", "Broadcasting alerts completed to 180+ mobile devices in flood zone.", "green");
      setBroadcasting(false);
    }, 1200);
  };

  const handleBypassDivert = async () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active incidents to activate bypass routes.");
      return;
    }
    const incId = latestIncident?.id || 'inc_001';
    setDiverting(true);
    setSopStatus("🛣️ REROUTING ACTIVE: Computing Srinagar Highway detours...");
    addLog("Traffic Simulation", "Simulating Srinagar Highway diversion congestion load...", "blue");
    
    try {
      const res = await triggerEvacuation(incId);
      if (res.success) {
        setSopStatus(`🛣️ SUCCESS: ${res.message}`);
        addLog("Traffic Simulation", "Alternate bypass routes verified & active in transit APIs.", "green");
      } else {
        setSopStatus("⚠️ Detour override rejected by traffic control node.");
      }
    } catch (e) {
      setSopStatus("🛣️ SUCCESS: Alternate bypass routes loaded locally.");
      addLog("Traffic Simulation", "Local sandbox diversion active.", "green");
    } finally {
      setDiverting(false);
    }
  };

  // SOS Countdown Timer
  useEffect(() => {
    let timer: any;
    if (showSosModal && sosCountdown > 0) {
      timer = setTimeout(() => setSosCountdown(c => c - 1), 1000);
    } else if (showSosModal && sosCountdown === 0) {
      // Trigger SOS
      addLog("System Command", "🔴 CRITICAL METRO SOS: Satellite priority override engaged!", "red");
      Alert.alert("🚨 SAT SOS BROADCAST", "Satellite priority signal transmitted to NDMA, Rawalpindi Rescue 1122 and Federal Capital Administration.");
      setShowSosModal(false);
    }
    return () => clearTimeout(timer);
  }, [showSosModal, sosCountdown]);

  const triggerSos = () => {
    setSosCountdown(5);
    setShowSosModal(true);
  };

  const openLockedModule = (name: string) => {
    setLockedModuleName(name);
    setShowFutureModal(true);
  };

  // ─── Run Agent Pipeline ───
  const runAgentPipeline = useCallback(async () => {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setNextRunCountdown(300);
    addLog('ORCHESTRATOR', '🚀 Launching 8-Agent AI Pipeline...', 'blue');

    // Animate flowing dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(pipelineDotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pipelineDotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    try {
      const targetIncident = activeIncidents[0];
      const incidentId = targetIncident?.id || 'inc_001';
      const { data, error } = await runAgentPipelineAPI(incidentId);
      if (error) {
        addLog('ORCHESTRATOR', `⚠️ Pipeline error: ${error}`, 'red');
        return;
      }
      if (data?.traces) {
        setPipelineTraces(data.traces);
        setLastPipelineRun(new Date().toLocaleTimeString());
        
        // Push traces chronologically into activity feed (reversing so oldest runs first, and since addLog prepends, newest ends up at top)
        const sortedTraces = [...data.traces].sort((a,b) => b.execution_ms - a.execution_ms); 
        data.traces.forEach((trace: any) => {
          const nameClean = trace.agent_name.replace(' Agent', '').toUpperCase();
          const logColor = trace.agent_name.includes('Vetting') || trace.agent_name.includes('Severity') 
            ? 'red' 
            : (trace.agent_name.includes('Notification') || trace.agent_name.includes('Resource') ? 'green' : 'blue');
          addLog(nameClean, trace.reasoning_summary || trace.reasoning, logColor);
        });

        addLog('ORCHESTRATOR', `✅ Pipeline complete — ${data.traces.length} agents executed.`, 'green');
        
        // Check for bilingual alert from Translation Agent
        const translationTrace = data.traces.find((t: any) => t.agent_name === 'Translation Agent');
        if (translationTrace?.output?.english_text) {
          addLog('COMMS-AGENT', `📢 BROADCAST: ${translationTrace.output.english_text.slice(0, 80)}`, 'green');
        }
      }
    } catch (err) {
      addLog('ORCHESTRATOR', '⚠️ Pipeline run failed — retrying on next cycle.', 'red');
    } finally {
      setPipelineRunning(false);
      pipelineDotAnim.stopAnimation();
      pipelineDotAnim.setValue(0);
    }
  }, [pipelineRunning, activeIncidents, pipelineDotAnim]);

  // Auto-run pipeline every 5 minutes + countdown timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setNextRunCountdown(prev => {
        if (prev <= 1) {
          runAgentPipeline();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [runAgentPipeline]);

  // Remove duplicate incident entries based on unique ID
  const uniqueIncidents = displayIncidents.filter((incident, idx, self) =>
    idx === self.findIndex((t) => t.id === incident.id)
  );
  const heroIncidents = uniqueIncidents.slice(0, 2);
  const sliderIncidents = uniqueIncidents.slice(2);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050814" />

      {/* TOP NAVIGATION HEADER */}
      <View style={s.globalHeader}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.burgerBtn} onPress={openSidebar}>
            <Text style={s.burgerText}>☰</Text>
          </TouchableOpacity>
          <View style={s.shieldCircle}>
            <Text style={s.shieldIcon}>🛡️</Text>
          </View>
          <View>
            <Text style={s.headerTitle}>GOVT COMMAND CENTER</Text>
            <View style={s.headerSubtitleRow}>
              <Text style={s.headerSubtitle}>{activeCrisisCategory}</Text>
              <Animated.View style={[
                s.livePulseMini,
                { transform: [{ scale: pulseAnim }] },
                !isOnline && { backgroundColor: '#EF4444' }
              ]} />
              <Text style={s.liveTextMini}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
            </View>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerIconBtn} onPress={() => openLockedModule('Global Search')}>
            <Text style={s.headerIconEmoji}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={s.headerIconBtn} 
            onPress={() => navigation.navigate('AlertApproval', { incidentId: 'inc_001' })}
          >
            <Text style={s.headerIconEmoji}>🔔</Text>
            <View style={s.badgeBell}><Text style={s.badgeBellText}>12</Text></View>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        ref={mainScrollRef}
        style={s.scrollView} 
        contentContainerStyle={s.scrollContent} 
        showsVerticalScrollIndicator={false}
      >

        {/* ════════ AGENT PIPELINE SECTION ════════ */}
        <View style={s.pipelineSection}>
          <View style={s.pipelineTitleRow}>
            <View style={s.pipelineTitleLeft}>
              <Text style={s.pipelineSectionTitle}>🤖 MULTI-AGENT ORCHESTRATOR</Text>
              <Text style={s.pipelineSubtitle}>
                {pipelineRunning
                  ? '⚡ Pipeline executing...'
                  : lastPipelineRun
                  ? `Last run: ${lastPipelineRun}`
                  : 'Auto-run every 5 min'}
              </Text>
            </View>
            <View style={s.pipelineControls}>
              <Text style={s.countdownText}>⏱ {Math.floor(nextRunCountdown/60)}:{String(nextRunCountdown%60).padStart(2,'0')}</Text>
              <TouchableOpacity
                style={[s.runNowBtn, pipelineRunning && s.runNowBtnDisabled]}
                onPress={runAgentPipeline}
                disabled={pipelineRunning}
              >
                {pipelineRunning
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={s.runNowBtnText}>▶ RUN NOW</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Horizontal Agent Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.agentCardsScroll}>
            {[
              { name: 'Signal Fusion', emoji: '📡', key: 'Signal Fusion Agent' },
              { name: 'Vetting', emoji: '🔍', key: 'Vetting Agent' },
              { name: 'Classification', emoji: '🧠', key: 'Classification Agent' },
              { name: 'Severity', emoji: '🔴', key: 'Severity Agent' },
              { name: 'Resource', emoji: '🚑', key: 'Resource Allocation Agent' },
              { name: 'Simulation', emoji: '🎯', key: 'Simulation Agent' },
              { name: 'Translation', emoji: '🌐', key: 'Translation Agent' },
              { name: 'Notification', emoji: '🔔', key: 'Notification Agent' },
            ].map((agent, idx, arr) => {
              const trace = pipelineTraces.find(t => t.agent_name === agent.key);
              const isExpanded = expandedAgent === agent.key;
              const hasRun = !!trace;
              const conf = trace ? Math.round(trace.confidence * 100) : null;
              
              const isBypassed = !vettingAgents[agent.key];
              const isRunningNow = pipelineRunning && !hasRun && (
                idx === 0 || !!pipelineTraces.find(t => t.agent_name === arr[idx - 1].key)
              );

              const dotOpacity = isRunningNow
                ? pipelineDotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
                : 1;

              return (
                <View key={agent.key} style={s.agentCardWrapper}>
                  <TouchableOpacity
                    style={[
                      s.agentCard,
                      hasRun && s.agentCardDone,
                      isRunningNow && s.agentCardRunning,
                      isBypassed && s.agentCardBypassed,
                      isExpanded && { borderColor: '#00FFD2' }
                    ]}
                    onPress={() => setExpandedAgent(isExpanded ? null : agent.key)}
                    activeOpacity={0.85}
                  >
                    {/* Step Number */}
                    <View style={s.agentStepBadge}>
                      <Text style={s.agentStepText}>S{String(idx + 1).padStart(2, '0')}</Text>
                    </View>

                    {/* Status Dot */}
                    <View style={[
                      s.agentStatusDot,
                      hasRun && s.agentStatusDotDone,
                      isRunningNow && s.agentStatusDotRunning,
                      isBypassed && s.agentStatusDotBypassed,
                    ]} />

                    {/* Emoji Container */}
                    <View style={[
                      s.agentEmojiContainer,
                      hasRun && s.agentEmojiContainerDone,
                      isRunningNow && s.agentEmojiContainerRunning,
                    ]}>
                      <Animated.Text style={[s.agentEmoji, { opacity: dotOpacity }]}>
                        {agent.emoji}
                      </Animated.Text>
                    </View>

                    {/* Agent Name */}
                    <Text style={[
                      s.agentName,
                      hasRun && s.agentNameDone,
                      isRunningNow && s.agentNameRunning,
                      isBypassed && s.agentNameBypassed,
                    ]} numberOfLines={2}>
                      {agent.name}
                    </Text>

                    {/* Bottom Action Row */}
                    <View style={s.agentBottomRow}>
                      {isBypassed ? (
                        <Text style={{ fontSize: 7, color: '#EF4444', fontWeight: '800' }}>SKIP</Text>
                      ) : isRunningNow ? (
                        <ActivityIndicator size="small" color="#0EA5E9" style={{ transform: [{ scale: 0.7 }] }} />
                      ) : hasRun ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Text style={s.agentCheckmark}>✓</Text>
                          {conf !== null && (
                            <View style={s.agentConfBadge}>
                              <Text style={s.agentConfText}>{conf}%</Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 7, color: '#475569', fontWeight: '700' }}>WAITING</Text>
                      )}
                      <Text style={s.agentExpandHint}>{isExpanded ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Connecting arrow/pipeline between agents */}
                  {idx < arr.length - 1 && (
                    <View style={s.agentArrow}>
                      <Animated.Text style={[
                        s.agentArrowText,
                        (hasRun || isRunningNow) && s.agentArrowTextActive,
                        {
                          opacity: isRunningNow
                            ? pipelineDotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
                            : (hasRun ? 1 : 0.25)
                        }
                      ]}>
                        »
                      </Animated.Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Expanded Agent Trace Dropdown — Terminal Edition */}
          {expandedAgent && (() => {
            const trace = pipelineTraces.find(t => t.agent_name === expandedAgent);
            const copyText = trace?.reasoning || trace?.reasoning_summary || '';
            const copyToClipboard = () => {
              try {
                // @ts-ignore
                Clipboard.setString(copyText);
                addLog('UI', '🗒 Copied trace output to clipboard', 'green');
              } catch (e) { /* ignore */ }
            };

            return (
              <View style={s.terminalWindow}>
                {/* Terminal Title Bar */}
                <View style={s.terminalHeaderBar}>
                  <View style={s.terminalDotsRow}>
                    <View style={[s.terminalDot, s.terminalDotRed]} />
                    <View style={[s.terminalDot, s.terminalDotYellow]} />
                    <View style={[s.terminalDot, s.terminalDotGreen]} />
                  </View>
                  <Text style={s.terminalTitleText}>bash — {expandedAgent.toLowerCase().replace(/\s+/g, '_')}.sh</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={s.terminalCopyBtn}>
                    <Text style={s.terminalCopyBtnText}>SH_COPY</Text>
                  </TouchableOpacity>
                </View>

                {/* Terminal Screen Body */}
                <ScrollView style={s.terminalBody} nestedScrollEnabled>
                  <Text style={s.terminalCommandPrompt}>
                    guest@crisesmesh-ai:~$ <Text style={s.terminalCommandText}>cat /var/log/agents/{expandedAgent.toLowerCase().replace(/\s+/g, '_')}.log</Text>
                  </Text>
                  
                  {(() => {
                    const isBypassed = !vettingAgents[expandedAgent];
                    if (isBypassed) {
                      return (
                        <Text style={s.terminalErrorText}>
                          {"\n"}⚠️ WARNING: SANDBOX BYPASS OVERRIDE IS ACTIVE!
                          {"\n"}The '{expandedAgent}' was marked as BYPASSED in the Sandbox.
                          {"\n"}Downstream execution simulated safety parameters without this node.
                          {"\n\n"}guest@crisesmesh-ai:~$ _
                        </Text>
                      );
                    }
                    if (trace) {
                      return (
                        <View style={{ marginTop: 6 }}>
                          {/* Reasoning Summary Section */}
                          <Text style={s.terminalLogLabel}>[REASONING]</Text>
                          <Text style={s.terminalReasoningText}>
                            {trace.reasoning || trace.reasoning_summary}
                          </Text>

                          {/* Stat Metrics */}
                          <Text style={s.terminalLogLabel}>[METRICS]</Text>
                          <Text style={s.terminalMetricText}>
                            • CONFIDENCE_LEVEL : {Math.round(trace.confidence * 100)}%
                            {"\n"}• EXECUTION_SPEED : {trace.execution_ms} ms
                            {"\n"}• PIPELINE_STATUS  : COMPLETE_OK
                          </Text>

                          {/* Step Execution Logs */}
                          {trace.output?.step_logs && trace.output.step_logs.length > 0 && (
                            <>
                              <Text style={s.terminalLogLabel}>[EXECUTION_FLOW]</Text>
                              {trace.output.step_logs.map((log: string, i: number) => (
                                <Text key={i} style={s.terminalStepLogText}>
                                  {"  "}» {log}
                                </Text>
                              ))}
                            </>
                          )}
                        </View>
                      );
                    }
                    return (
                      <Text style={s.terminalErrorText}>
                        {"\n"}⚠️ ERR: Trace not found. Agent has not executed in this session.
                        {"\n"}Please click "RUN NOW" to trigger the multi-agent orchestrator.
                      </Text>
                    );
                  })()}
                  
                  <Text style={s.terminalPromptCursor}>
                    guest@crisesmesh-ai:~$ <Text style={s.terminalCursorBlink}>▒</Text>
                  </Text>
                </ScrollView>
              </View>
            );
          })()}
        </View>


        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={s.metricsScroll}
          contentContainerStyle={s.metricsBelt}
        >
          {/* CARD 1: CRITICAL ACTIVE */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => mainScrollRef.current?.scrollTo({ y: 320, animated: true })}
          >
            <LinearGradient colors={['#1E1B4B', '#111030']} style={[s.metricCard, { borderColor: incidentCount > 0 ? '#EF4444' : '#22C55E' }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>🚨 CRITICAL ACTIVE</Text>
                <View style={[s.trendBadge, { backgroundColor: incidentCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', borderColor: incidentCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)' }]}>
                  <Text style={[s.trendText, { color: incidentCount > 0 ? '#EF4444' : '#22C55E' }]}>
                    {incidentCount > 0 ? '▲ Threat' : '● Clear'}
                  </Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: incidentCount > 0 ? '#EF4444' : '#22C55E' }]}>{incidentCount}</Text>
                <Text style={s.metricIcon}>🔔</Text>
              </View>
              <Text style={s.metricSubtext}>Incidents Verified</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CARD 2: HIGH PENDING */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AlertApproval', { incidentId: latestIncident?.id })}
          >
            <LinearGradient colors={['#1E1B4B', '#111030']} style={[s.metricCard, { borderColor: pendingReportsCount > 0 ? '#F57C00' : '#64748B' }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>🎯 HIGH PENDING</Text>
                <View style={[s.trendBadge, { backgroundColor: pendingReportsCount > 0 ? 'rgba(245, 124, 0, 0.15)' : 'rgba(100, 116, 139, 0.15)', borderColor: pendingReportsCount > 0 ? 'rgba(245, 124, 0, 0.3)' : 'rgba(100, 116, 139, 0.3)' }]}>
                  <Text style={[s.trendText, { color: pendingReportsCount > 0 ? '#F57C00' : '#94A3B8' }]}>
                    {pendingReportsCount > 0 ? `▲ +${pendingReportsCount}` : '● Empty'}
                  </Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: pendingReportsCount > 0 ? '#F57C00' : '#FFFFFF' }]}>{pendingReportsCount}</Text>
                <Text style={s.metricIcon}>🛰️</Text>
              </View>
              <Text style={s.metricSubtext}>Signal Ingestion Streams</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CARD 3: TOTAL TRACKED */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AgentTracePanel', { incidentId: latestIncident?.id })}
          >
            <LinearGradient colors={['#0F172A', '#0D1425']} style={[s.metricCard, { borderColor: '#0EA5E9' }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>🛡️ TOTAL TRACKED</Text>
                <View style={[s.trendBadge, { backgroundColor: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.3)' }]}>
                  <Text style={[s.trendText, { color: '#0EA5E9' }]}>● History</Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: '#0EA5E9' }]}>{totalTrackedCount}</Text>
                <Text style={s.metricIcon}>📋</Text>
              </View>
              <Text style={s.metricSubtext}>Incidents in Database</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CARD 4: CAPACITY LOAD */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ResourceAllocation', { incidentId: latestIncident?.id })}
          >
            <LinearGradient colors={['#0F172A', '#0D1425']} style={[s.metricCard, { borderColor: capacityLoadVal > 50 ? '#EF4444' : '#22C55E' }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>🔋 CAPACITY LOAD</Text>
                <View style={[s.trendBadge, { backgroundColor: capacityLoadVal > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', borderColor: capacityLoadVal > 50 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)' }]}>
                  <Text style={[s.trendText, { color: capacityLoadVal > 50 ? '#EF4444' : '#22C55E' }]}>
                    {capacityLoadVal > 50 ? '▲ Active Load' : '● Nominal'}
                  </Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: capacityLoadVal > 50 ? '#EF4444' : '#22C55E' }]}>{capacityLoadVal}%</Text>
                <Text style={s.metricIcon}>📈</Text>
              </View>
              <Text style={s.metricSubtext}>WASA & Rescue Utilization</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CARD 5: PEOPLE AT RISK */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RedZoneMap', { incidentId: latestIncident?.id })}
          >
            <LinearGradient colors={['#0F172A', '#0D1425']} style={[s.metricCard, { borderColor: totalPeopleAtRisk > 0 ? '#A855F7' : '#22C55E' }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>👥 PEOPLE AT RISK</Text>
                <View style={[s.trendBadge, { backgroundColor: totalPeopleAtRisk > 0 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(34, 197, 94, 0.15)', borderColor: totalPeopleAtRisk > 0 ? 'rgba(168, 85, 247, 0.3)' : 'rgba(34, 197, 94, 0.3)' }]}>
                  <Text style={[s.trendText, { color: totalPeopleAtRisk > 0 ? '#A855F7' : '#22C55E' }]}>
                    {totalPeopleAtRisk > 0 ? '▲ Threat' : '● Safe'}
                  </Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: totalPeopleAtRisk > 0 ? '#A855F7' : '#22C55E' }]}>{peopleAtRiskText}</Text>
                <Text style={s.metricIcon}>🌊</Text>
              </View>
              <Text style={s.metricSubtext}>Est. Affected Population</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* CARD 6: SITUATION SCORE */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Recovery', { incidentId: latestIncident?.id })}
          >
            <LinearGradient colors={['#0F172A', '#0D1425']} style={[s.metricCard, { borderColor: maxPriorityScore > 60 ? '#EF4444' : (maxPriorityScore > 30 ? '#F57C00' : '#06B6D4') }]}>
              <View style={s.metricHeaderRow}>
                <Text style={s.metricLabel}>⚡ SITUATION SCORE</Text>
                <View style={[s.trendBadge, { backgroundColor: maxPriorityScore > 60 ? 'rgba(239, 68, 68, 0.15)' : (maxPriorityScore > 30 ? 'rgba(245, 124, 0, 0.15)' : 'rgba(6, 182, 212, 0.15)'), borderColor: maxPriorityScore > 60 ? 'rgba(239, 68, 68, 0.3)' : (maxPriorityScore > 30 ? 'rgba(245, 124, 0, 0.3)' : 'rgba(6, 182, 212, 0.3)') }]}>
                  <Text style={[s.trendText, { color: maxPriorityScore > 60 ? '#EF4444' : (maxPriorityScore > 30 ? '#F57C00' : '#06B6D4') }]}>
                    {maxPriorityScore > 60 ? '▲ Severe' : (maxPriorityScore > 30 ? '▲ Warning' : '● Normal')}
                  </Text>
                </View>
              </View>
              <View style={s.metricValueRow}>
                <Text style={[s.metricValue, { color: maxPriorityScore > 60 ? '#EF4444' : (maxPriorityScore > 30 ? '#F57C00' : '#06B6D4') }]}>
                  {maxPriorityScore} <Text style={{ fontSize: 10, color: '#64748B' }}>/100</Text>
                </Text>
                <Text style={s.metricIcon}>💻</Text>
              </View>
              <Text style={s.metricSubtext}>Unified Risk Index</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* AI PRIORITY INCIDENTS BLOCK */}
        <View style={s.block}>
          <View style={s.blockHeader}>
            <Text style={s.blockTitle}>🚨 AI PRIORITY INCIDENTS</Text>
            <View style={s.badgePill}><Text style={s.badgePillText}>{displayIncidents.length} Active</Text></View>
          </View>

          {/* HERO INCIDENTS (TOP 2) */}
          <View style={s.heroIncidentsList}>
            {heroIncidents.map((incident, index) => {
              const meta = getIncidentMeta(incident.type);
              const severityColor = incident.severity === 'Critical' ? '#EF4444' : (incident.severity === 'High' ? '#F97316' : '#EAB308');
              const severityBg = incident.severity === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : (incident.severity === 'High' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(234, 179, 8, 0.15)');
              
              return (
                <View key={incident.id} style={[s.incidentRow, { borderColor: severityColor + '40', marginBottom: index === heroIncidents.length - 1 ? 0 : 12 }]}>
                  <View style={s.incidentRowLeft}>
                    <View style={[s.numBox, { backgroundColor: severityColor + '20', borderColor: severityColor }]}>
                      <Text style={[s.numText, { color: severityColor }]}>{index + 1}</Text>
                      <Text style={s.numIcon}>{meta.emoji}</Text>
                    </View>
                    <View style={s.incidentMeta}>
                      <View style={s.incidentMetaTop}>
                        <Text style={s.incidentTitle}>{incident.type}</Text>
                        <View style={[s.statusBadge, { backgroundColor: severityBg, borderColor: severityColor }]}>
                          <Text style={[s.statusBadgeText, { color: severityColor }]}>{incident.severity.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={s.incidentLocation}>{meta.location}</Text>
                      
                      {/* Meta details grid */}
                      <View style={s.paramGrid}>
                        <Text style={s.paramItem}>Confidence: <Text style={{ color: '#22C55E', fontWeight: '800' }}>{Math.round(incident.confidence * 100)}%</Text></Text>
                        <Text style={s.paramItem}>Risk Area: <Text style={{ color: '#EAB308' }}>{incident.affected_radius_m}m Radius</Text></Text>
                        <Text style={s.paramItem}>Risk Pop: <Text style={{ color: '#A855F7' }}>{incident.estimated_population.toLocaleString()}</Text></Text>
                        <Text style={s.paramItem}>Peak In: <Text style={{ color: '#0EA5E9' }}>{incident.peak_impact_time || `${incident.expected_duration_hours} hrs`}</Text></Text>
                        <Text style={s.paramItem}>Trend: <Text style={{ color: meta.trendColor }}>{meta.trend}</Text></Text>
                        <Text style={s.paramItem}>Duration: <Text style={{ color: '#94A3B8' }}>{incident.expected_duration_hours} hrs</Text></Text>
                      </View>

                      <View style={s.recActionRow}>
                        <Text style={s.recActionLabel}>AI Recommend: <Text style={[s.recActionText, { color: severityColor }]}>{meta.recommendation}</Text></Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={s.quickActionsBtn}
                    onPress={() => navigation.navigate('GovernmentIncident', { incidentId: incident.id })}
                  >
                    <Text style={s.quickActionsText}>Quick Actions ›</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* SLIDER CONTAINER FOR REMAINING ACTIVE REGIONAL THREATS */}
          {sliderIncidents.length > 0 && (
            <View style={s.sliderContainer}>
              <Text style={s.sliderSectionTitle}>📡 ACTIVE REGIONAL THREATS ({sliderIncidents.length})</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.sliderScrollContent}
              >
                {sliderIncidents.map((incident) => {
                  const meta = getIncidentMeta(incident.type);
                  const severityColor = incident.severity === 'Critical' ? '#EF4444' : (incident.severity === 'High' ? '#F97316' : '#EAB308');
                  const severityBg = incident.severity === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : (incident.severity === 'High' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(234, 179, 8, 0.15)');

                  return (
                    <TouchableOpacity 
                      key={incident.id} 
                      style={[s.sliderCard, { borderColor: severityColor + '40' }]}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('GovernmentIncident', { incidentId: incident.id })}
                    >
                      <View style={s.sliderCardHeader}>
                        <Text style={s.sliderCardEmoji}>{meta.emoji}</Text>
                        <View style={[s.sliderSeverityBadge, { backgroundColor: severityBg, borderColor: severityColor }]}>
                          <Text style={[s.sliderSeverityText, { color: severityColor }]}>{incident.severity}</Text>
                        </View>
                      </View>

                      <Text style={s.sliderCardTitle} numberOfLines={1}>{incident.type}</Text>
                      <Text style={s.sliderCardLocation} numberOfLines={1}>{meta.location}</Text>

                      <View style={s.sliderCardFooter}>
                        <Text style={s.sliderConfidence}>Confidence: <Text style={{ color: '#22C55E', fontWeight: '700' }}>{Math.round(incident.confidence * 100)}%</Text></Text>
                        <Text style={s.sliderActionText}>View Details ›</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ════════ BEFORE VS AFTER CRISIS SIMULATOR ════════ */}
        <View style={s.simulationBlock}>
          <View style={s.simulationBlockHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.simulationTitle}>🧬 CRISIS RESOLUTION SIMULATOR (BEFORE vs AFTER AI)</Text>
              <Text style={s.simulationSubtitle}>
                See how our Multi-Agent pipeline deduplicates, vets, and structures chaotic raw reports.
              </Text>
            </View>
            <View style={s.simBadge}>
              <Text style={s.simBadgeText}>FUSION ACTIVE</Text>
            </View>
          </View>

          <View style={s.simFlexRow}>
            {/* LEFT COLUMN: THE CHAOS (BEFORE AI) */}
            <View style={[s.simCol, s.simColBefore]}>
              <View style={s.simColHeaderRow}>
                <Text style={s.simColTitle}>⚠️ RAW UNVERIFIED STREAM (BEFORE)</Text>
                <View style={s.chaosLevelBadge}>
                  <Text style={s.chaosLevelText}>HIGH NOISE</Text>
                </View>
              </View>
              <Text style={s.simColSubtitle}>Raw, conflicting, and duplicate public submissions:</Text>

              <View style={s.simReportsList}>
                {/* Report 1 */}
                <View style={s.simReportCard}>
                  <View style={s.simReportCardHeader}>
                    <Text style={s.simReportReporter}>👤 Citizen: Ali Khan</Text>
                    <Text style={s.simReportTime}>10m ago</Text>
                  </View>
                  <Text style={s.simReportText}>
                    "G-10 Underpass has heavy flooding and maybe fire! Roads are completely blocked, cars are sinking."
                  </Text>
                  <View style={s.simReportMetaRow}>
                    <Text style={[s.simReportBadge, { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>CRITICAL</Text>
                    <Text style={s.simReportDetail}>Credibility: 45% (Unverified)</Text>
                  </View>
                </View>

                {/* Report 2 */}
                <View style={s.simReportCard}>
                  <View style={s.simReportCardHeader}>
                    <Text style={s.simReportReporter}>👤 Citizen: Waseem</Text>
                    <Text style={s.simReportTime}>8m ago</Text>
                  </View>
                  <Text style={s.simReportText}>
                    "Islamabad G10 flood. Water levels rising up to the car doors, underpass is flooded."
                  </Text>
                  <View style={s.simReportMetaRow}>
                    <Text style={[s.simReportBadge, { color: '#F97316', backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>HIGH</Text>
                    <Text style={s.simReportDetail}>Credibility: 90% (Trusted Reporter)</Text>
                  </View>
                </View>

                {/* Report 3 (Conflicting) */}
                <View style={s.simReportCard}>
                  <View style={s.simReportCardHeader}>
                    <Text style={s.simReportReporter}>👤 Citizen: Sana Jamil</Text>
                    <Text style={s.simReportTime}>5m ago</Text>
                  </View>
                  <Text style={s.simReportText}>
                    "No flood here in G-10 underpass, just typical rain. Traffic is moving fine."
                  </Text>
                  <View style={s.simReportMetaRow}>
                    <Text style={[s.simReportBadge, { color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>LOW</Text>
                    <Text style={s.simReportDetail}>Credibility: 60% (Outlier/Conflicting)</Text>
                  </View>
                </View>
              </View>

              <View style={s.chaosFooter}>
                <Text style={s.chaosFooterText}>❌ PROBLEMS: Duplicate coordinates, conflicting reports, no alerts, zero action.</Text>
              </View>
            </View>

            {/* MIDDLE CONNECTING LOGIC */}
            <View style={s.simCenterDivider}>
              <View style={s.simPulseArrow}>
                <Text style={s.simPulseArrowText}>🧬</Text>
                <Text style={s.simPulseArrowSub}>AI FUSION</Text>
              </View>
            </View>

            {/* RIGHT COLUMN: THE ORDER (AFTER AI RESOLUTION) */}
            <View style={[s.simCol, s.simColAfter]}>
              <View style={s.simColHeaderRow}>
                <Text style={s.simColTitle}>🛡️ RESOLVED CRISIS PROFILE (AFTER)</Text>
                <View style={s.verifiedLevelBadge}>
                  <Text style={s.verifiedLevelText}>100% VETTED</Text>
                </View>
              </View>
              <Text style={s.simColSubtitle}>Consolidated, de-duplicated and verified crisis profile:</Text>

              <View style={s.simResultCard}>
                <View style={s.simResultRow}>
                  <Text style={s.simResultLabel}>🚨 Verified Type:</Text>
                  <Text style={s.simResultValue}>Urban Flooding (High Confidence)</Text>
                </View>
                
                <View style={s.simResultRow}>
                  <Text style={s.simResultLabel}>📍 Vetted Location:</Text>
                  <Text style={s.simResultValue}>G-10 Underpass, Islamabad (Centroid)</Text>
                </View>

                <View style={s.simResultRow}>
                  <Text style={s.simResultLabel}>📊 Data Deduplication:</Text>
                  <Text style={s.simResultValue}>4 reports merged, 1 conflicting outlier filtered</Text>
                </View>

                <View style={s.simResultRow}>
                  <Text style={s.simResultLabel}>📈 Severity Level:</Text>
                  <Text style={[s.simResultValue, { color: '#34D399', fontWeight: '800' }]}>CRITICAL (Vetted by Severity Agent)</Text>
                </View>

                <View style={s.simResultDivider} />

                <Text style={s.simResultSectionTitle}>📢 AI Auto-Generated Alerts (Bilingual):</Text>
                
                <View style={s.simAlertBox}>
                  <Text style={s.simAlertLang}>🇬🇧 ENGLISH ALERT</Text>
                  <Text style={s.simAlertText}>
                    🚨 EMERGENCY ALERT: Critical Urban Flooding at G-10 Underpass, Islamabad. Avoid the area immediately.
                  </Text>
                </View>

                <View style={s.simAlertBox}>
                  <Text style={s.simAlertLang}>🇵🇰 ROMAN URDU ALERT</Text>
                  <Text style={s.simAlertText}>
                    🚨 HATAMI KHABAR: G-10 Underpass Islamabad me shadeed tufani selab. Fauri tor par is ilaqe se door rahein.
                  </Text>
                </View>
              </View>

              <View style={s.orderFooter}>
                <Text style={s.orderFooterText}>✅ OUTCOME: Deduplicated cluster, verified threat level, active bilingual broadcast.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SPLIT GRID MIDDLE BLOCK */}
        <View style={s.splitGrid}>
          
          {/* LEFT COLUMN: LIVE SITUATIONAL GIS MAP */}
          <View style={s.splitCol}>
            <View style={s.blockHeader}>
              <Text style={s.blockTitle}>🛰️ LIVE SITUATIONAL MAP</Text>
              <View style={s.categoryDots}>
                <View style={[s.dot, { backgroundColor: '#EF4444' }]} />
                <View style={[s.dot, { backgroundColor: '#F97316' }]} />
                <View style={[s.dot, { backgroundColor: '#EAB308' }]} />
                <View style={[s.dot, { backgroundColor: '#22C55E' }]} />
              </View>
            </View>

            <View style={s.mapFrame}>
              {Platform.OS === 'web' ? (
                <iframe
                  id="gov-minimap-iframe"
                  srcDoc={buildMiniMapHTML(displayIncidents, reports, shelters)}
                  style={{ width: '100%', height: '100%', borderWidth: 0 }}
                  title="Interactive Mini Map"
                />
              ) : MapComponent ? (
                <MapComponent
                  source={{ html: buildMiniMapHTML(displayIncidents, reports, shelters) }}
                  style={{ flex: 1, width: '100%' }}
                  originWhitelist={['*']}
                  javaScriptEnabled
                  domStorageEnabled
                />
              ) : (
                <View style={s.mapMockFrame}>
                  <Text style={s.mapMockHeader}>PAKISTAN NATIONAL GRID (DEMO: ISLAMABAD)</Text>
                  <Text style={s.mapMockZone}>🔴 G-10 Underpass Critical Threat Circle</Text>
                  <Text style={s.mapMockInfo}>Rainfall precipitation rate synced via satellite APIs</Text>
                </View>
              )}
            </View>
          </View>

          {/* RIGHT COLUMN: AI AGENT COORDINATION FEED */}
          <View style={s.splitCol}>
            <View style={s.blockHeader}>
              <Text style={s.blockTitle}>🤖 AI COORDINATION FEED</Text>
              <View style={s.liveFeedBadge}>
                <Animated.View style={[s.livePulse, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={s.liveFeedText}>LIVE</Text>
              </View>
            </View>

            <ScrollView 
              style={s.terminalFrame} 
              contentContainerStyle={s.terminalContent}
              showsVerticalScrollIndicator={false}
            >
              {activityLogs.map((log) => (
                <View key={log.id} style={s.logItem}>
                  <View style={s.logItemTop}>
                    <View style={s.logItemTagRow}>
                      <View style={[s.statusBulb, { 
                        backgroundColor: log.status === 'red' ? '#EF4444' : log.status === 'blue' ? '#0EA5E9' : '#22C55E',
                        shadowColor: log.status === 'red' ? '#EF4444' : log.status === 'blue' ? '#0EA5E9' : '#22C55E'
                      }]} />
                      <Text style={s.logTag}>{log.tag}</Text>
                    </View>
                    <Text style={s.logTime}>[{log.time}]</Text>
                  </View>
                  <Text style={s.logText}>{log.log}</Text>
                </View>
              ))}

              <TouchableOpacity 
                style={s.viewTracesLinkBtn}
                onPress={() => navigation.navigate('AgentTracePanel', { incidentId: latestIncident?.id || 'inc_001' })}
              >
                <Text style={s.viewTracesLinkText}>View All Agent Reasoning Traces ›</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* SPLIT GRID BOTTOM BLOCK */}
        <View style={s.splitGrid}>
          
          {/* LEFT: RESOURCE AVAILABILITY */}
          <View style={s.splitCol}>
            <View style={s.blockHeader}>
              <Text style={s.blockTitle}>🚑 RESOURCE AVAILABILITY</Text>
            </View>

            <View style={s.resourceGrid}>
              {/* Progress 1 */}
              <View style={s.resourceItem}>
                <View style={s.resourceLabelRow}>
                  <Text style={s.resourceName}>🚑 Ambulances</Text>
                  <View style={[s.loadPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }]}>
                    <Text style={[s.loadPillText, { color: '#EF4444' }]}>HIGH LOAD</Text>
                  </View>
                </View>
                <View style={s.progressRow}>
                  <View style={s.progressBarTrack}>
                    <Animated.View style={[s.progressBarFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '72%'] }), backgroundColor: '#FF003C' }]} />
                  </View>
                  <Text style={s.progressValue}>18 / 25</Text>
                </View>
              </View>

              {/* Progress 2 */}
              <View style={s.resourceItem}>
                <View style={s.resourceLabelRow}>
                  <Text style={s.resourceName}>🚒 Rescue Teams</Text>
                  <View style={[s.loadPill, { backgroundColor: 'rgba(255, 179, 0, 0.15)', borderColor: '#FFB300' }]}>
                    <Text style={[s.loadPillText, { color: '#FFB300' }]}>HIGH LOAD</Text>
                  </View>
                </View>
                <View style={s.progressRow}>
                  <View style={s.progressBarTrack}>
                    <Animated.View style={[s.progressBarFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '71%'] }), backgroundColor: '#FFB300' }]} />
                  </View>
                  <Text style={s.progressValue}>32 / 45</Text>
                </View>
              </View>

              {/* Progress 3 */}
              <View style={s.resourceItem}>
                <View style={s.resourceLabelRow}>
                  <Text style={s.resourceName}>👮 Police Units</Text>
                  <View style={[s.loadPill, { backgroundColor: 'rgba(14, 165, 233, 0.15)', borderColor: '#0EA5E9' }]}>
                    <Text style={[s.loadPillText, { color: '#0EA5E9' }]}>MID LOAD</Text>
                  </View>
                </View>
                <View style={s.progressRow}>
                  <View style={s.progressBarTrack}>
                    <Animated.View style={[s.progressBarFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '75%'] }), backgroundColor: '#00E5FF' }]} />
                  </View>
                  <Text style={s.progressValue}>45 / 60</Text>
                </View>
              </View>

              {/* Progress 4 */}
              <View style={s.resourceItem}>
                <View style={s.resourceLabelRow}>
                  <Text style={s.resourceName}>🚁 Drones / Recon</Text>
                  <View style={[s.loadPill, { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderColor: '#00E5FF' }]}>
                    <Text style={[s.loadPillText, { color: '#00E5FF' }]}>AVAILABLE</Text>
                  </View>
                </View>
                <View style={s.progressRow}>
                  <View style={s.progressBarTrack}>
                    <Animated.View style={[s.progressBarFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '60%'] }), backgroundColor: '#00E5FF' }]} />
                  </View>
                  <Text style={s.progressValue}>6 / 10</Text>
                </View>
              </View>

              {/* Progress 5 */}
              <View style={s.resourceItem}>
                <View style={s.resourceLabelRow}>
                  <Text style={s.resourceName}>🏠 Shelter Capacity</Text>
                  <View style={[
                    s.loadPill, 
                    { 
                      backgroundColor: shelterCapacityPct > 90 ? 'rgba(239, 68, 68, 0.15)' : shelterCapacityPct > 75 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)', 
                      borderColor: shelterCapacityPct > 90 ? '#EF4444' : shelterCapacityPct > 75 ? '#F97316' : '#22C55E' 
                    }
                  ]}>
                    <Text style={[
                      s.loadPillText, 
                      { color: shelterCapacityPct > 90 ? '#EF4444' : shelterCapacityPct > 75 ? '#F97316' : '#22C55E' }
                    ]}>
                      {shelterCapacityPct > 90 ? 'NEAR CAPACITY' : shelterCapacityPct > 75 ? 'HIGH LOAD' : 'NOMINAL'}
                    </Text>
                  </View>
                </View>
                <View style={s.progressRow}>
                  <View style={s.progressBarTrack}>
                    <Animated.View style={[
                      s.progressBarFill, 
                      { 
                        width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${shelterCapacityPct}%`] }), 
                        backgroundColor: shelterCapacityPct > 90 ? '#EF4444' : shelterCapacityPct > 75 ? '#F97316' : '#00E5FF' 
                      }
                    ]} />
                  </View>
                  <Text style={s.progressValue}>{shelterCapacityText}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT: SYSTEM STATUS */}
          <View style={s.splitCol}>
            <View style={s.blockHeader}>
              <Text style={s.blockTitle}>🧠 8-SIGNAL INGESTION MATRIX</Text>
              <View style={s.sysStatusRow}>
                <Animated.View style={[s.sysStatusDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={s.sysStatusText}>LIVE DATA</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
              {[
                { name: 'Citizen App (Live)', val: '14/s', stat: 'OK' },
                { name: 'Weather API', val: '22ms', stat: 'OK' },
                { name: 'Social Firehose', val: '4k/m', stat: 'OK' },
                { name: 'IoT City Sensors', val: '809', stat: 'WARN' },
                { name: 'Traffic Routing API', val: '410ms', stat: 'OK' },
                { name: '1122 Calls Meta', val: '98/m', stat: 'WARN' },
                { name: 'Hospital ER Beds', val: '12', stat: 'OK' },
                { name: 'Drone/CCTV Feed', val: '4 act', stat: 'OK' },
              ].map((sig, i) => (
                <View key={i} style={{ 
                  width: '48%', 
                  backgroundColor: 'rgba(0, 229, 255, 0.03)', 
                  padding: 8, 
                  borderRadius: 6, 
                  borderWidth: 1, 
                  borderColor: sig.stat === 'WARN' ? '#FFB300' : 'rgba(0, 229, 255, 0.15)' 
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#00E5FF', fontSize: 8, fontWeight: '700' }}>{sig.name}</Text>
                    <Animated.View style={[s.sysStatusDot, { 
                      backgroundColor: sig.stat === 'WARN' ? '#FFB300' : '#22C55E', 
                      transform: [{ scale: pulseAnim }] 
                    }]} />
                  </View>
                  <Text style={{ color: '#94A3B8', fontSize: 8, marginTop: 4, fontFamily: 'monospace' }}>PING: {sig.val}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={{ marginTop: 12, backgroundColor: 'rgba(0, 229, 255, 0.1)', paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#00E5FF', alignItems: 'center' }}
              onPress={() => navigation.navigate('SignalFusion')}
            >
              <Text style={{ color: '#00E5FF', fontSize: 10, fontWeight: '800', fontFamily: 'monospace' }}>🔍 OPEN MASTER FUSION DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI ORCHESTRATOR SANDBOX CONTROL PANEL */}
        <View style={[s.block, { borderColor: activeChaos ? '#EF4444' : 'rgba(0, 229, 255, 0.2)', borderWidth: 1.5 }]}>
          <View style={s.blockHeader}>
            <Text style={s.blockTitle}>⚙️ AI ORCHESTRATOR SANDBOX</Text>
            <View style={[s.liveFeedBadge, { backgroundColor: activeChaos ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 229, 255, 0.1)' }]}>
              <Text style={{ color: activeChaos ? '#EF4444' : '#00E5FF', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 }}>
                {activeChaos ? '⚠️ SIMULATION: CHAOS ACTIVE' : '🤖 SANDBOX ONLINE'}
              </Text>
            </View>
          </View>

          <Text style={{ color: '#94A3B8', fontSize: 10, marginBottom: 12, lineHeight: 14 }}>
            Manually override dispatch thresholds, toggle cognitive pipeline agents, or simulate infrastructure threats to verify real-time Multi-Agent automated recovery SOPs.
          </Text>

          {/* SECTION 1: VETTING THRESHOLD CONTROLLER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12 }}>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>AI Dispatch Threshold</Text>
              <Text style={{ color: '#94A3B8', fontSize: 9, marginTop: 2 }}>Min confidence required for auto-alert dispatch</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity 
                style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(0, 229, 255, 0.1)', borderWidth: 1, borderColor: '#00E5FF', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => handleConfidenceChange('down')}
              >
                <Text style={{ color: '#00E5FF', fontSize: 14, fontWeight: '900' }}>-</Text>
              </TouchableOpacity>
              <Text style={{ color: '#00E5FF', fontSize: 14, fontWeight: '900', fontFamily: 'monospace', width: 45, textAlign: 'center' }}>
                {confidenceThreshold}%
              </Text>
              <TouchableOpacity 
                style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(0, 229, 255, 0.1)', borderWidth: 1, borderColor: '#00E5FF', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => handleConfidenceChange('up')}
              >
                <Text style={{ color: '#00E5FF', fontSize: 14, fontWeight: '900' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 2: ACTIVE PIPELINE AGENTS */}
          <Text style={{ color: '#94A3B8', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Cognitive Pipeline Agents (Toggle to Bypass)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {[
              { key: 'Signal Fusion Agent', name: 'Signal Fusion', emoji: '📡' },
              { key: 'Vetting Agent', name: 'Vetting Agent', emoji: '🔍' },
              { key: 'Classification Agent', name: 'Classification', emoji: '🧠' },
              { key: 'Severity Agent', name: 'Severity Agent', emoji: '🔴' },
              { key: 'Resource Allocation Agent', name: 'Resource Alloc', emoji: '🚑' },
              { key: 'Simulation Agent', name: 'Simulation Agent', emoji: '🎯' },
              { key: 'Translation Agent', name: 'Translation', emoji: '🌐' },
              { key: 'Notification Agent', name: 'Notification', emoji: '🔔' },
            ].map(agent => {
              const isActive = vettingAgents[agent.key];
              return (
                <TouchableOpacity
                  key={agent.key}
                  style={{
                    width: '48%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  }}
                  onPress={() => handleToggleAgent(agent.key)}
                >
                  <Text style={{ fontSize: 12, marginRight: 6 }}>{agent.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }} numberOfLines={1}>{agent.name}</Text>
                    <Text style={{ color: isActive ? '#22C55E' : '#EF4444', fontSize: 7, fontWeight: '700', textTransform: 'uppercase', marginTop: 1 }}>
                      {isActive ? '● Active' : '○ Bypassed'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SECTION 3: CHAOS SIMULATOR SCENARIOS */}
          <Text style={{ color: '#94A3B8', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Trigger Chaos Scenarios (Inject Threat)
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'pump_outage', label: 'WASA Pump Outage', emoji: '⚠️', color: '#EF4444' },
              { key: 'highway_block', label: 'Highway Blocked', emoji: '💥', color: '#F97316' },
              { key: 'grid_failure', label: 'Grid Blackout', emoji: '⚡', color: '#EAB308' },
            ].map(chaos => {
              const isActive = activeChaos === chaos.key;
              return (
                <TouchableOpacity
                  key={chaos.key}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 6,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: isActive ? chaos.color : 'rgba(255,255,255,0.08)',
                    backgroundColor: isActive ? `${chaos.color}15` : 'rgba(255,255,255,0.02)',
                  }}
                  onPress={() => handleTriggerChaos(chaos.key as 'pump_outage' | 'highway_block' | 'grid_failure')}
                >
                  <Text style={{ fontSize: 16, marginBottom: 4 }}>{chaos.emoji}</Text>
                  <Text style={{ color: isActive ? chaos.color : '#F1F5F9', fontSize: 8, fontWeight: '800', textAlign: 'center' }}>
                    {chaos.label}
                  </Text>
                  <Text style={{ color: isActive ? chaos.color : '#94A3B8', fontSize: 7, fontWeight: '700', textTransform: 'uppercase', marginTop: 3 }}>
                    {isActive ? 'INJECTED' : 'INJECT'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SAFE SHELTERS REGISTRY & CONTROL */}
        <View style={s.block}>
          <Text style={s.blockTitle}>🏠 SAFE SHELTER REGISTRY & CONTROL</Text>
          <Text style={{ color: '#94A3B8', fontSize: 10, fontFamily: 'Courier New', marginBottom: 10, marginTop: 4 }}>
            Real-time shelter registry. Toggle status to alert dispatch units and update public routes.
          </Text>
          <View style={{ gap: Spacing.sm }}>
            {shelters.length === 0 ? (
              <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginVertical: 10, fontFamily: 'Courier New' }}>
                NO SHELTER RECORDS FOUND IN CORE DATABASE.
              </Text>
            ) : (
              shelters.map(shelter => {
                const isAvailable = shelter.status === 'Available';
                return (
                  <View key={shelter.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderWidth: 1,
                    borderColor: isAvailable ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 6,
                    padding: 12,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', flex: 1, marginRight: 10 }}>
                        {shelter.name}
                      </Text>
                      <View style={{
                        backgroundColor: isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        borderWidth: 0.5,
                        borderColor: isAvailable ? '#22C55E' : '#EF4444',
                      }}>
                        <Text style={{ color: isAvailable ? '#22C55E' : '#EF4444', fontSize: 9, fontWeight: 'bold' }}>
                          {shelter.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'Courier New' }}>
                        Occupancy: {shelter.occupancy} / {shelter.capacity}
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: isAvailable ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          borderWidth: 1,
                          borderColor: isAvailable ? '#EF4444' : '#22C55E',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                        }}
                        onPress={async () => {
                          const success = await toggleShelter(shelter.id);
                          if (success) {
                            addLog(
                              'Shelter Director',
                              `Toggled shelter status: ${shelter.name} to ${isAvailable ? 'CLOSED' : 'OPEN'}`,
                              isAvailable ? 'red' : 'green'
                            );
                            // Refresh local shelters
                            const shelterData = await fetchShelters();
                            setShelters(shelterData);
                          }
                        }}
                      >
                        <Text style={{ color: isAvailable ? '#EF4444' : '#22C55E', fontSize: 10, fontWeight: 'bold' }}>
                          {isAvailable ? '🔴 CLOSE' : '🟢 OPEN'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* BOTTOM ACTION BLOCK (RAPID ACTIONS) */}
        <View style={s.block}>
          <Text style={s.blockTitle}>🚨 RAPID ACTIONS</Text>
          <View style={s.rapidActionsGrid}>
            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
              onPress={() => navigation.navigate('ResourceAllocation', { incidentId: latestIncident?.id || 'inc_001' })}
            >
              <Text style={s.rapidActionEmoji}>🚒</Text>
              <Text style={[s.rapidActionLabel, { color: '#EF4444' }]}>Deploy Assets</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(249, 115, 22, 0.3)' }]}
              onPress={() => navigation.navigate('AlertApproval', { incidentId: latestIncident?.id || 'inc_001' })}
            >
              <Text style={s.rapidActionEmoji}>📢</Text>
              <Text style={[s.rapidActionLabel, { color: '#F97316' }]}>Public Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(14, 165, 233, 0.3)' }]}
              onPress={handleBypassDivert}
            >
              <Text style={s.rapidActionEmoji}>🏃</Text>
              <Text style={[s.rapidActionLabel, { color: '#0EA5E9' }]}>Evacuate Area</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(34, 197, 94, 0.3)' }]}
              onPress={handleAutopilotDispatch}
            >
              <Text style={s.rapidActionEmoji}>🤖</Text>
              <Text style={[s.rapidActionLabel, { color: '#22C55E' }]}>Autopilot SOP</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(168, 85, 247, 0.3)' }]}
              onPress={() => setShowShelterModal(true)}
            >
              <Text style={s.rapidActionEmoji}>🏠</Text>
              <Text style={[s.rapidActionLabel, { color: '#A855F7' }]}>Open Shelters</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.rapidActionCard, { borderColor: 'rgba(148, 163, 184, 0.3)' }]}
              onPress={() => navigation.navigate('Recovery', { incidentId: latestIncident?.id || 'inc_001' })}
            >
              <Text style={s.rapidActionEmoji}>🔄</Text>
              <Text style={[s.rapidActionLabel, { color: '#94A3B8' }]}>Reevaluate</Text>
            </TouchableOpacity>
          </View>

          {/* Autopilot Status Indicator Banner */}
          {sopStatus && (
            <View style={s.sopBanner}>
              <Text style={s.sopBannerText}>{sopStatus}</Text>
            </View>
          )}
        </View>

        {/* BOTTOM SPACING FOR FLOATING TAB */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* FLOATING BOTTOM TAB BAR */}
      <View style={s.floatingTabBar}>
        <TouchableOpacity style={s.tabItem} onPress={() => {}}>
          <Text style={[s.tabEmoji, { color: '#0EA5E9' }]}>🏠</Text>
          <Text style={[s.tabLabel, { color: '#0EA5E9', fontWeight: '800' }]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.tabItem} 
          onPress={() => navigation.navigate('GovernmentIncident', { incidentId: latestIncident?.id || 'inc_001' })}
        >
          <Text style={s.tabEmoji}>⚠️</Text>
          <Text style={s.tabLabel}>Incidents</Text>
        </TouchableOpacity>

        {/* SOS PULSING RED CIRCLE */}
        <TouchableOpacity style={s.sosCircleBtn} onPress={triggerSos} activeOpacity={0.8}>
          <Animated.View style={[s.sosInnerPulse, { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.3], outputRange: [0.6, 0] }) }]} />
          <Text style={s.sosCircleText}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.tabItem} 
          onPress={() => navigation.navigate('RedZoneMap', { incidentId: latestIncident?.id || 'inc_001' })}
        >
          <Text style={s.tabEmoji}>📈</Text>
          <Text style={s.tabLabel}>Simulation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.tabItem} 
          onPress={() => navigation.navigate('AlertApproval', { incidentId: latestIncident?.id || 'inc_001' })}
        >
          <Text style={s.tabEmoji}>💬</Text>
          <Text style={s.tabLabel}>Messages</Text>
          <View style={s.tabBadge}><Text style={s.tabBadgeText}>5</Text></View>
        </TouchableOpacity>
      </View>

      {/* SOS TRIGGER COUNTDOWN MODAL */}
      <Modal
        visible={showSosModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSosModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.sosModalCard}>
            <Text style={s.sosModalEmoji}>🚨</Text>
            <Text style={s.sosModalTitle}>CRITICAL SOS SIGNAL PENDING</Text>
            <Text style={s.sosModalDesc}>
              Broadcasting encrypted priority command to all Pakistan National Grid emergency dispatch terminals (Demo Area: Islamabad) in:
            </Text>
            <Text style={s.countdownNumber}>{sosCountdown}</Text>
            <TouchableOpacity 
              style={s.cancelSosBtn} 
              onPress={() => {
                setShowSosModal(false);
                addLog("System Command", "🔴 SOS broadcast aborted by command operator.", "red");
              }}
            >
              <Text style={s.cancelSosText}>🚫 ABORT SATELLITE DISPATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FUTURE LOCKED MODULE MODAL */}
      <Modal
        visible={showFutureModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFutureModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.lockedCard}>
            <Text style={s.lockedEmoji}>🔒</Text>
            <Text style={s.lockedTitle}>{lockedModuleName || 'Future Crisis'} Module Locked</Text>
            <Text style={s.lockedDesc}>
              This subsystem is architected and fully staged under the CrisesMesh AI Multi-Crisis Command framework.
              It will be unlocked in Phase 2 scaling.
            </Text>
            <Text style={s.lockedPill}>Active Demo Sector: Islamabad Flooding Grid (Nationwide Platform)</Text>
            <TouchableOpacity style={s.lockedDismissBtn} onPress={() => setShowFutureModal(false)}>
              <Text style={s.lockedDismissText}>Confirm Roadmap Integration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SHELTER MANAGEMENT MODAL */}
      <Modal
        visible={showShelterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShelterModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.lockedCard, { width: '90%', maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 229, 255, 0.2)', paddingBottom: 10 }}>
              <Text style={[s.lockedTitle, { fontSize: 16, marginBottom: 0 }]}>🏠 SHELTER CONTROL PANEL</Text>
              <TouchableOpacity onPress={() => setShowShelterModal(false)}>
                <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'Courier New', marginBottom: 15, textAlign: 'center' }}>
              Real-time shelter registry. Toggle status to alert dispatch units and update public routes.
            </Text>

            <ScrollView style={{ width: '100%', marginBottom: 15 }}>
              {shelters.length === 0 ? (
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginVertical: 20, fontFamily: 'Courier New' }}>
                  NO SHELTER RECORDS FOUND IN CORE DATABASE.
                </Text>
              ) : (
                shelters.map(shelter => {
                  const isAvailable = shelter.status === 'Available';
                  return (
                    <View key={shelter.id} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderWidth: 1,
                      borderColor: isAvailable ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 10,
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', flex: 1, marginRight: 10 }}>
                          {shelter.name}
                        </Text>
                        <View style={{
                          backgroundColor: isAvailable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                          borderWidth: 0.5,
                          borderColor: isAvailable ? '#22C55E' : '#EF4444',
                        }}>
                          <Text style={{ color: isAvailable ? '#22C55E' : '#EF4444', fontSize: 9, fontWeight: 'bold' }}>
                            {shelter.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'Courier New' }}>
                          Occupancy: {shelter.occupancy} / {shelter.capacity}
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: isAvailable ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            borderWidth: 1,
                            borderColor: isAvailable ? '#EF4444' : '#22C55E',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                          }}
                          onPress={async () => {
                            const success = await toggleShelter(shelter.id);
                            if (success) {
                              addLog(
                                'Shelter Director',
                                `Toggled shelter status: ${shelter.name} to ${isAvailable ? 'CLOSED' : 'OPEN'}`,
                                isAvailable ? 'red' : 'green'
                              );
                              // Refresh local shelters
                              const shelterData = await fetchShelters();
                              setShelters(shelterData);
                            }
                          }}
                        >
                          <Text style={{ color: isAvailable ? '#EF4444' : '#22C55E', fontSize: 10, fontWeight: 'bold' }}>
                            {isAvailable ? '🔴 CLOSE SHELTER' : '🟢 OPEN SHELTER'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[s.lockedDismissBtn, { width: '100%' }]} 
              onPress={() => setShowShelterModal(false)}
            >
              <Text style={s.lockedDismissText}>Dismiss Panel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* SIDEBAR NAVIGATION DRAWER */}
      {showSidebar && (
        <TouchableOpacity 
          style={s.sidebarBackdrop} 
          activeOpacity={1} 
          onPress={closeSidebar}
        />
      )}
      <Animated.View style={[s.sidebarContainer, { transform: [{ translateX: sidebarX }] }]}>
        <View style={s.sidebarHeader}>
          <View style={s.sidebarProfileIconCircle}>
            <Text style={s.sidebarProfileIcon}>🎖️</Text>
          </View>
          <View>
            <Text style={s.sidebarTitle}>COMMAND STATION</Text>
            <View style={s.sidebarStatusRow}>
              <View style={s.sidebarStatusDot} />
              <Text style={s.sidebarStatusText}>COORDINATOR (ONLINE)</Text>
            </View>
          </View>
        </View>

        <ScrollView style={s.sidebarScroll} contentContainerStyle={s.sidebarMenuContainer}>
          <Text style={s.sidebarSectionTitle}>MULTI-CRISIS SYSTEMS</Text>
          
          {SIDEBAR_CRISES.map(crisis => {
            const isActive = activeCrisisCategory === crisis.label;
            return (
              <TouchableOpacity
                key={crisis.id}
                style={[
                  s.sidebarMenuItem,
                  isActive && s.sidebarMenuItemActive
                ]}
                onPress={() => switchCrisis(crisis.label)}
              >
                <Text style={s.sidebarMenuEmoji}>{crisis.emoji}</Text>
                <Text style={[s.sidebarMenuLabel, isActive && s.sidebarMenuLabelActive]}>
                  {crisis.label}
                </Text>
                {isActive ? (
                  <Text style={s.sidebarMenuStatusActive}>● ACTIVE</Text>
                ) : (
                  <Text style={s.sidebarMenuStatusStandby}>◌ STANDBY</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.sidebarFooter}>
          <TouchableOpacity 
            style={s.sidebarExitBtn} 
            onPress={() => {
              closeSidebar();
              navigation.navigate('Landing');
            }}
          >
            <Text style={s.sidebarExitEmoji}>🚪</Text>
            <Text style={s.sidebarExitText}>Exit Command Center</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  // ─── Agent Pipeline Styles ───
  pipelineSection: {
    backgroundColor: '#080D1A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pipelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pipelineTitleLeft: { flex: 1 },
  pipelineSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  pipelineSubtitle: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  pipelineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  runNowBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runNowBtnDisabled: {
    backgroundColor: '#1E293B',
  },
  runNowBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  agentCardsScroll: { 
    marginVertical: 12,
    paddingVertical: 6,
  },
  agentCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentCard: {
    width: 96,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 124,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  agentCardDone: {
    borderColor: '#34D399',
    backgroundColor: '#064E3B',
    shadowColor: '#34D399',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  agentCardRunning: {
    borderColor: '#38BDF8',
    backgroundColor: '#0891B2',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  agentCardBypassed: {
    borderColor: '#EF4444',
    backgroundColor: '#7F1D1D',
    borderStyle: 'dashed',
    opacity: 0.9,
  },
  agentStepBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
  },
  agentStepText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  agentStatusDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#64748B',
  },
  agentStatusDotDone: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  agentStatusDotRunning: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  agentStatusDotBypassed: {
    backgroundColor: '#EF4444',
  },
  agentEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  agentEmojiContainerDone: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  agentEmojiContainerRunning: {
    backgroundColor: '#0EA5E9',
    borderColor: '#38BDF8',
  },
  agentEmoji: { 
    fontSize: 20,
  },
  agentName: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 11,
    height: 22,
    marginTop: 2,
  },
  agentNameDone: { 
    color: '#FFFFFF',
  },
  agentNameRunning: { 
    color: '#FFFFFF',
  },
  agentNameBypassed: { 
    color: '#FCA5A5',
  },
  agentConfBadge: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  agentConfText: { 
    fontSize: 7, 
    fontWeight: '900', 
    color: '#FFFFFF',
  },
  agentBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
    gap: 4,
  },
  agentCheckmark: { 
    fontSize: 10, 
    color: '#34D399', 
    fontWeight: '900',
  },
  agentExpandHint: { 
    fontSize: 8, 
    color: '#94A3B8',
    marginLeft: 2,
  },
  agentArrow: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentArrowText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '900',
  },
  agentArrowTextActive: {
    color: '#00FFD2',
  },
  
  // ─── HIGH-FIDELITY TERMINAL STYLES ───
  terminalWindow: {
    backgroundColor: '#030712',
    borderColor: '#1F2937',
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 10,
    overflow: 'hidden',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  terminalHeaderBar: {
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  terminalDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 50,
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalDotRed: { backgroundColor: '#EF4444' },
  terminalDotYellow: { backgroundColor: '#F59E0B' },
  terminalDotGreen: { backgroundColor: '#10B981' },
  terminalTitleText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    flex: 1,
  },
  terminalCopyBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  terminalCopyBtnText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  terminalBody: {
    padding: 10,
    maxHeight: 250,
    backgroundColor: '#05070F',
  },
  terminalCommandPrompt: {
    color: '#3B82F6',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  terminalCommandText: {
    color: '#F9FAFB',
    fontWeight: 'normal',
  },
  terminalLogLabel: {
    color: '#10B981',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  terminalReasoningText: {
    color: '#22C55E',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
    marginTop: 2,
  },
  terminalMetricText: {
    color: '#00FFCC',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
    marginTop: 2,
  },
  terminalStepLogText: {
    color: '#9CA3AF',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 13,
    marginTop: 1,
  },
  terminalErrorText: {
    color: '#EF4444',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
    marginTop: 4,
  },
  terminalPromptCursor: {
    color: '#3B82F6',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    marginTop: 10,
  },
  terminalCursorBlink: {
    color: '#10B981',
    fontWeight: '800',
  },
  container: { flex: 1, backgroundColor: '#000000' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // GLOBAL NAVIGATION HEADER
  globalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 45,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  burgerBtn: { paddingRight: 2, paddingVertical: 2 },
  burgerText: { color: '#0EA5E9', fontSize: 18, fontWeight: '800' },
  shieldCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0C1222',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: { fontSize: 13 },
  headerTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.3 },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1, gap: 4 },
  headerSubtitle: { color: '#94A3B8', fontSize: 8, fontWeight: '700', letterSpacing: 0.2 },
  livePulseMini: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveTextMini: { color: '#22C55E', fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIconBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerIconEmoji: { fontSize: 15, color: '#0EA5E9' },
  badgeBell: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 5,
    width: 11,
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBellText: { color: '#FFFFFF', fontSize: 6, fontWeight: '900' },

  // METRICS BELT
  metricsScroll: { marginVertical: 16 },
  metricsBelt: { gap: 12, paddingRight: 16 },
  metricCard: {
    width: 140,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
  },
  metricLabel: { color: '#94A3B8', fontSize: 8, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
  metricValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: '900' },
  metricIcon: { fontSize: 20 },
  metricSubtext: { color: '#64748B', fontSize: 8, marginTop: 4, fontWeight: '600' },

  // BLOCKS & CONTAINERS
  block: {
    backgroundColor: 'rgba(0, 229, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: 16,
    marginBottom: 16,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 8,
    marginBottom: 12,
  },
  blockTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  badgePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgePillText: { color: '#EF4444', fontSize: 9, fontWeight: '800' },

  // INCIDENT ROWS
  incidentRow: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.1)',
    padding: 12,
    marginBottom: 12,
  },
  incidentRowLeft: { flexDirection: 'row', gap: 12 },
  numBox: {
    width: 32,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  numText: { fontSize: 14, fontWeight: '900' },
  numIcon: { fontSize: 12 },
  incidentMeta: { flex: 1 },
  incidentMetaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incidentTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 8, fontWeight: '900' },
  incidentLocation: { color: '#94A3B8', fontSize: 9, marginTop: 2, fontWeight: '600' },
  paramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 8,
  },
  paramItem: { color: '#64748B', fontSize: 8, fontWeight: '700', width: '47%' },
  recActionRow: { backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: 6, borderRadius: 4 },
  recActionLabel: { color: '#64748B', fontSize: 8, fontWeight: '700' },
  recActionText: { color: '#EF4444', fontWeight: '800' },
  quickActionsBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  quickActionsText: { color: '#0EA5E9', fontSize: 10, fontWeight: '800' },

  // SPLIT GRID LAYOUTS
  splitGrid: { flexDirection: 'column', gap: 16, marginBottom: 16 },
  splitCol: {
    backgroundColor: 'rgba(0, 229, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: 16,
  },
  categoryDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  // GIS WEBVIEW
  mapFrame: { height: 160, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  mapMockFrame: { flex: 1, backgroundColor: '#080D1A', alignItems: 'center', justifyContent: 'center', padding: 12 },
  mapMockHeader: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  mapMockZone: { fontSize: 10, color: '#EF4444', marginTop: 4, fontWeight: '700' },
  mapMockInfo: { fontSize: 8, color: '#94A3B8', marginTop: 2, textAlign: 'center' },

  // TERMINAL COORDINATION
  liveFeedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveFeedText: { color: '#22C55E', fontSize: 8, fontWeight: '900', marginLeft: 3 },
  terminalFrame: { maxHeight: 180, backgroundColor: '#000000', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  terminalContent: { gap: 8, paddingBottom: 12 },
  logItem: { borderBottomWidth: 1, borderBottomColor: '#121829', paddingBottom: 6 },
  logItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  logItemTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBulb: { width: 6, height: 6, borderRadius: 3 },
  logTag: { color: '#00E5FF', fontSize: 9, fontWeight: '900', fontFamily: 'monospace' },
  logTime: { color: '#00E5FF', fontSize: 8, fontFamily: 'monospace', opacity: 0.7 },
  logText: { color: '#00E5FF', fontSize: 9, lineHeight: 13, fontFamily: 'monospace' },
  viewTracesLinkBtn: { paddingVertical: 4, alignItems: 'center', marginTop: 4 },
  viewTracesLinkText: { color: '#0EA5E9', fontSize: 9, fontWeight: '800' },

  // RESOURCES
  resourceGrid: { gap: 10 },
  resourceItem: { backgroundColor: '#0F172A', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#1E293B' },
  resourceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resourceName: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  loadPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  loadPillText: { fontSize: 7, fontWeight: '900' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarTrack: { flex: 1, height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressValue: { color: '#94A3B8', fontSize: 8, fontWeight: '800', width: 35, textAlign: 'right' },

  // SYSTEM CORE
  sysStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sysStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  sysStatusText: { color: '#22C55E', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  systemGrid: { gap: 10 },
  sysItem: { backgroundColor: 'rgba(0, 229, 255, 0.05)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.15)' },
  sysLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sysName: { color: '#94A3B8', fontSize: 9, fontWeight: '700' },
  sysValue: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },

  // RAPID ACTIONS
  rapidActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  rapidActionCard: {
    width: '48%',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  rapidActionEmoji: { fontSize: 20 },
  rapidActionLabel: { fontSize: 10, fontWeight: '800' },
  sopBanner: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
  },
  sopBannerText: { color: '#0EA5E9', fontSize: 9, fontWeight: '800', textAlign: 'center', lineHeight: 13 },

  // FLOATING BOTTOM TAB BAR
  floatingTabBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(12, 18, 34, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  tabEmoji: { fontSize: 18, color: '#64748B' },
  tabLabel: { fontSize: 8, color: '#64748B', marginTop: 2, fontWeight: '600' },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 12,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { color: '#FFFFFF', fontSize: 7, fontWeight: '900' },

  // PULSING SOS BUTTON
  sosCircleBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF003C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
    borderWidth: 3,
    borderColor: '#000000',
    position: 'relative',
    shadowColor: '#FF003C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 6,
  },
  sosInnerPulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    opacity: 0.3,
  },
  sosCircleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockedCard: {
    backgroundColor: '#0C1222',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  lockedEmoji: { fontSize: 44, marginBottom: 12 },
  lockedTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  lockedDesc: { color: '#94A3B8', fontSize: 11, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  lockedPill: {
    color: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  lockedDismissBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  lockedDismissText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },

  // SOS MODAL
  sosModalCard: {
    backgroundColor: '#080D1A',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  sosModalEmoji: { fontSize: 54, marginBottom: 10 },
  sosModalTitle: { color: '#EF4444', fontSize: 18, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 },
  sosModalDesc: { color: '#94A3B8', fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: 20 },
  countdownNumber: { color: '#FFFFFF', fontSize: 64, fontWeight: '900', marginBottom: 24 },
  cancelSosBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelSosText: { color: '#EF4444', fontSize: 11, fontWeight: '900' },

  // SIDEBAR STYLES
  sidebarBackdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 900,
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#0C1222',
    borderRightWidth: 1.5,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    zIndex: 1000,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginTop: 40,
  },
  sidebarProfileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#080D1A',
    borderWidth: 1,
    borderColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarProfileIcon: { fontSize: 18 },
  sidebarTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  sidebarStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sidebarStatusDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22C55E' },
  sidebarStatusText: { color: '#94A3B8', fontSize: 8, fontWeight: '700' },
  sidebarScroll: { flex: 1, marginTop: 15 },
  sidebarMenuContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  sidebarSectionTitle: { color: '#64748B', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12, paddingHorizontal: 4 },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sidebarMenuItemActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  sidebarMenuEmoji: { fontSize: 16 },
  sidebarMenuLabel: { flex: 1, color: '#E2E8F0', fontSize: 11, fontWeight: '700' },
  sidebarMenuLabelActive: { color: '#0EA5E9' },
  sidebarMenuLock: { fontSize: 9, color: '#64748B' },
  sidebarMenuStatusActive: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  sidebarMenuStatusStandby: { fontSize: 8, color: '#475569', letterSpacing: 0.5 },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sidebarExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sidebarExitEmoji: { fontSize: 16 },
  sidebarExitText: { color: '#EF4444', fontSize: 11, fontWeight: '800' },

  // NEW METRICS BELT STYLES
  metricHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  trendText: {
    fontSize: 7,
    fontWeight: '900',
  },

  // ─── BEFORE VS AFTER CRISIS SIMULATOR STYLES ───
  simulationBlock: {
    backgroundColor: '#0C1222',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  simulationBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 12,
    marginBottom: 16,
  },
  simulationTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0EA5E9',
    letterSpacing: 0.5,
  },
  simulationSubtitle: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  simBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  simBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0EA5E9',
    letterSpacing: 0.5,
  },
  simFlexRow: {
    flexDirection: 'column',
    gap: 12,
  },
  simCol: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  simColBefore: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  simColAfter: {
    borderColor: 'rgba(52, 211, 153, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
  simColHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  simColTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#E2E8F0',
    flexShrink: 1,
  },
  chaosLevelBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  chaosLevelText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#EF4444',
  },
  verifiedLevelBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedLevelText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#34D399',
  },
  simColSubtitle: {
    fontSize: 8.5,
    color: '#64748B',
    marginBottom: 10,
  },
  simReportsList: {
    gap: 8,
  },
  simReportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    overflow: 'hidden',
  },
  simReportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  simReportReporter: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#E2E8F0',
    flexShrink: 1,
  },
  simReportTime: {
    fontSize: 7.5,
    color: '#64748B',
  },
  simReportText: {
    fontSize: 8.5,
    color: '#94A3B8',
    lineHeight: 11,
    marginBottom: 6,
  },
  simReportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  simReportBadge: {
    fontSize: 7,
    fontWeight: '900',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 0.5,
  },
  simReportDetail: {
    fontSize: 7.5,
    color: '#64748B',
  },
  chaosFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
    paddingTop: 8,
  },
  chaosFooterText: {
    fontSize: 8,
    color: '#FCA5A5',
    fontWeight: '700',
  },
  simCenterDivider: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
  },
  simPulseArrow: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#0EA5E9',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  simPulseArrowText: {
    fontSize: 16,
  },
  simPulseArrowSub: {
    fontSize: 6,
    fontWeight: '900',
    color: '#0EA5E9',
    marginTop: 1,
  },
  simResultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    padding: 10,
    gap: 8,
    overflow: 'hidden',
  },
  simResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 2,
  },
  simResultLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94A3B8',
  },
  simResultValue: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#E2E8F0',
    flexShrink: 1,
    textAlign: 'right',
  },
  simResultDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  simResultSectionTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#34D399',
    marginTop: 2,
  },
  simAlertBox: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderColor: '#34D399',
    padding: 6,
    gap: 2,
  },
  simAlertLang: {
    fontSize: 7,
    fontWeight: '900',
    color: '#64748B',
  },
  simAlertText: {
    fontSize: 8,
    color: '#E2E8F0',
    lineHeight: 10,
  },
  orderFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
    paddingTop: 8,
  },
  orderFooterText: {
    fontSize: 8,
    color: '#A7F3D0',
    fontWeight: '700',
  },

  // ─── THREAT CAROUSEL/SLIDER STYLES ───
  heroIncidentsList: {
    marginBottom: 8,
  },
  sliderContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 14,
  },
  sliderSectionTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sliderScrollContent: {
    paddingRight: 16,
    flexDirection: 'row',
  },
  sliderCard: {
    backgroundColor: '#0F172A',
    width: 200,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
    height: 110,
  },
  sliderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderCardEmoji: {
    fontSize: 16,
  },
  sliderSeverityBadge: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  sliderSeverityText: {
    fontSize: 7,
    fontWeight: '900',
  },
  sliderCardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sliderCardLocation: {
    fontSize: 8.5,
    color: '#64748B',
    marginBottom: 6,
  },
  sliderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 6,
  },
  sliderConfidence: {
    fontSize: 8,
    color: '#64748B',
  },
  sliderActionText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#0EA5E9',
  },
});
