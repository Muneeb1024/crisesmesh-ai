/**
 * CrisesMesh AI — Citizen Safety Navigation Map (Premium Edition)
 * Features:
 * 1. Live interactive Leaflet.js map with OpenStreetMap tiles (Global coverage).
 * 2. Draggable Aap Ki Location pin to test threat boundaries.
 * 3. Dynamic Haversine proximity calculations against active incidents.
 * 4. Dual acoustic alerts: oscillating emergency siren (Web Audio API) + bilingual warning TTS.
 * 5. Glassmorphic overlays with Live Threat status and Silence controls.
 * 6. Dual WebView & Web Iframe wrappers for 100% web compatibility on Expo Web (8081).
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { listIncidents, fetchShelters } from '../services/api';
import { useAppStore } from '../store/useAppStore';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenMap'>;

// Standard Islamabad Coordinates for initial fallback
const DEFAULT_LAT = 33.6844;
const DEFAULT_LNG = 73.0479;

const LOCALIZATION = {
  en: {
    back: '←',
    title: 'Safety Map',
    subtitle: 'Real-time Threat Boundaries',
    refresh: '🔄 Refresh',
    dangerTitle: '🔴 RED ZONE INTRUSION DETECTED!',
    dangerDesc: 'Bohra Gali/Underpass flooding threat detected nearby. Avoid this area.',
    nearestHazard: 'Nearest Hazard',
    distance: 'Distance',
    meters: 'meters',
    silenceSiren: '🔕 Silence Acoustic Alarm',
    sirenSilenced: '🔇 Siren Silenced',
    safeTitle: '✅ SAFE SECTOR',
    safeDesc: 'No active flooding boundaries detected at your coordinates. Drag location pin to sandbox test.',
    closestThreat: 'Closest threat',
    away: 'away',
    advisoryTitle: '⚠️ Safety Advisories',
    advisory1: 'Do not attempt to cross flooded underpasses or roads.',
    advisory2: 'Keep your mobile phone fully charged for emergency dispatch.',
    aapKiLocation: 'Aap Ki Location',
    dragTest: 'Drag me to test proximity warning!',
    leafletSafeDetour: '🟢 Safe Detour Route',
  },
  ur: {
    back: '←',
    title: 'حفاظتی نقشہ',
    subtitle: 'حقیقی وقت کے خطرات کی حدود',
    refresh: '🔄 ریفریش',
    dangerTitle: '🔴 ریڈ زون کی دراندازی کا انکشاف!',
    dangerDesc: 'قریبی علاقے میں سیلاب کا خطرہ ہے۔ اس راستے سے پرہیز کریں۔',
    nearestHazard: 'قریبی خطرہ',
    distance: 'فاصلہ',
    meters: 'میٹر',
    silenceSiren: '🔕 سائرن بند کریں',
    sirenSilenced: '🔇 سائرن بند کر دیا گیا',
    safeTitle: '✅ محفوظ سیکٹر',
    safeDesc: 'آپ کے نقاط پر سیلاب کی کوئی فعال حد معلوم نہیں ہوئی۔ جانچ کے لیے پن کو ڈریگ کریں۔',
    closestThreat: 'قریبی خطرہ',
    away: 'دور',
    advisoryTitle: '⚠️ حفاظتی تدابیر',
    advisory1: 'سیلاب زدہ انڈر پاس یا سڑکوں کو پار کرنے کی کوشش نہ کریں۔',
    advisory2: 'ہنگامی امداد کے لیے اپنے موبائل فون کو مکمل چارج رکھیں۔',
    aapKiLocation: 'آپ کا مقام',
    dragTest: 'وارننگ ٹیسٹ کرنے کے لیے مجھے کھینچیں!',
    leafletSafeDetour: '🟢 محفوظ متبادل راستہ',
  }
};

export default function CitizenMapScreen() {
  const navigation = useNavigation<NavProp>();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User location & Proximity status
  const [userLocation, setUserLocation] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [insideZone, setInsideZone] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [nearestIncidentType, setNearestIncidentType] = useState<string>('');
  const [sirenSilenced, setSirenSilenced] = useState(false);

  const { lang, setLang } = useAppStore();
  const t = LOCALIZATION[lang];

  const webViewRef = useRef<any>(null);

  // Fetch active incidents from the backend API
  const fetchIncidents = async () => {
    try {
      const data = await listIncidents();
      setIncidents(data);
    } catch (err) {
      console.warn('[CitizenMap] Failed to load incidents:', err);
    }
    try {
      const shelterData = await fetchShelters();
      setShelters(shelterData);
    } catch (err) {
      console.warn('[CitizenMap] Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for incidents on mount or when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchIncidents();
      // Auto-detect GPS location
      async function getLiveGPS() {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          }
        } catch (e) {
          console.log('[CitizenMap] GPS auto-retrieval failed, using default Islamabad coords.');
        }
      }
      getLiveGPS();
    }, [])
  );

  // Handle messages posted from Leaflet Map (WebView or Iframe)
  const handleProximityMessage = (eventData: string) => {
    try {
      const data = JSON.parse(eventData);
      if (data.type === 'PROXIMITY_UPDATE') {
        setInsideZone(data.inside);
        setNearestDistance(data.distance);
        setNearestIncidentType(data.incidentType);
        setUserLocation({ lat: data.lat, lng: data.lng });
      }
    } catch (e) {
      // Ignored non-json messages
    }
  };

  // Listen to postMessage from web iframe if Platform is Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (e: MessageEvent) => {
        if (typeof e.data === 'string') {
          handleProximityMessage(e.data);
        }
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, []);

  // Post a message back to Leaflet inside WebView/iframe to silence/mute the siren
  const handleSilenceAlarm = () => {
    setSirenSilenced(true);
    const msg = JSON.stringify({ type: 'MUTE_SIREN' });
    if (Platform.OS === 'web') {
      const iframe = document.getElementById('citizen-map-iframe') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(msg, '*');
      }
    } else {
      webViewRef.current?.postMessage(msg);
    }
  };

  // Re-enable the siren (unsilence) when location resets
  useEffect(() => {
    if (!insideZone) {
      setSirenSilenced(false);
    }
  }, [insideZone]);

  // Construct Leaflet HTML payload dynamically based on active incidents
  const buildHTML = () => {
    // If no incidents exist, inject a fallback threat for Pakistan Demo context
    const activeThreats = incidents.length > 0 ? incidents : [
      {
        id: 'demo_fld',
        type: 'Urban Flooding',
        lat: 33.6938,
        lng: 73.0652, // G-10 Underpass
        affected_radius_m: 1200,
        severity: 'Critical'
      }
    ];

    const threatsJS = activeThreats.map(t => `
      // Render active Red Zone circle
      L.circle([${t.lat}, ${t.lng}], {
        radius: ${t.affected_radius_m || 1200},
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.16,
        weight: 2,
        dashArray: '5 5'
      }).addTo(map);

      // Render red threat marker
      var threatMarker = L.marker([${t.lat}, ${t.lng}], {
        icon: L.divIcon({
          html: '<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🌊</div>',
          className: '',
          iconAnchor: [13, 13]
        })
      }).addTo(map);

      threatMarker.bindPopup('<b>⚠️ ${t.type}</b><br>Severity: ${t.severity}<br>Radius: ${t.affected_radius_m || 1200}m');
    `).join('');

    // Pre-calculated route sample representing a detour
    const detourRoute = [
      [33.7050, 73.0400],
      [33.7010, 73.0480],
      [33.6980, 73.0380],
      [33.6920, 73.0350],
      [33.6880, 73.0480],
      [33.6850, 73.0750],
    ];

    const aapKiLocationStr = t.aapKiLocation;
    const dragTestStr = t.dragTest;
    const safeDetourStr = t.leafletSafeDetour;

    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; background: #f8fafc; }
        
        /* Pulse Animation for User Pin */
        .pulse-marker {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.25);
          border: 2px solid #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          animation: pulse 1.8s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0px rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0px rgba(16, 185, 129, 0); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script>
        var incidents = ${JSON.stringify(activeThreats)};
        var currentLang = "${lang}";
        var aapKiLocationStr = "${aapKiLocationStr}";
        var dragTestStr = "${dragTestStr}";
        
        // Initialize Map centered near default
        var map = L.map('map', { zoomControl: true }).setView([${userLocation.lat}, ${userLocation.lng}], 14);
        
        // OpenStreetMap Standard Tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);

        // Add visual threats
        ${threatsJS}

        // Render Active Available Shelters
        var shelters = ${JSON.stringify(shelters || [])};
        shelters.forEach(function(s) {
          if (s.status === 'Available') {
            var shelterMarker = L.marker([s.lat, s.lng], {
              icon: L.divIcon({
                html: '<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); font-family: sans-serif;">🏠</div>',
                className: '',
                iconAnchor: [13, 13]
              })
            }).addTo(map);
            shelterMarker.bindPopup('<b>🏠 ' + s.name + '</b><br>Occupancy: ' + s.occupancy + ' / ' + s.capacity + ' (Available)');
          }
        });

        // Render Detour Route Overlay
        L.polyline(${JSON.stringify(detourRoute)}, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '4 6'
        }).addTo(map).bindPopup('<b>${safeDetourStr}</b>');

        // Draggable Citizen Marker
        var userMarker = L.marker([${userLocation.lat}, ${userLocation.lng}], {
          draggable: true,
          icon: L.divIcon({
            html: '<div class="pulse-marker">📍</div>',
            className: '',
            iconAnchor: [16, 16]
          })
        }).addTo(map);

        userMarker.bindPopup('<b>🇵🇰 ' + aapKiLocationStr + '</b><br>' + dragTestStr).openPopup();

        // Proximity calculation (Haversine formula)
        function getDistance(lat1, lon1, lat2, lon2) {
          var R = 6371000; // Earth radius in meters
          var dLat = (lat2 - lat1) * Math.PI / 180;
          var dLon = (lon2 - lon1) * Math.PI / 180;
          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        }

        // Audio synthesizer & siren engine
        var audioCtx = null;
        var oscillator = null;
        var sirenInterval = null;
        var isSirenPlaying = false;
        var silenced = false;

        function playSiren() {
          if (isSirenPlaying || silenced) return;
          isSirenPlaying = true;
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            oscillator = audioCtx.createOscillator();
            var gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(550, audioCtx.currentTime); // standard frequency
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime); // soft warning volume
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            
            var toggleFreq = false;
            sirenInterval = setInterval(function() {
              if (!audioCtx || audioCtx.state === 'closed') return;
              var nextFreq = toggleFreq ? 550 : 850;
              oscillator.frequency.setValueAtTime(nextFreq, audioCtx.currentTime);
              toggleFreq = !toggleFreq;
            }, 400);
          } catch (e) {
            console.warn('Web Audio API not supported or locked:', e);
          }
        }

        function stopSiren() {
          if (!isSirenPlaying) return;
          isSirenPlaying = false;
          if (sirenInterval) {
            clearInterval(sirenInterval);
            sirenInterval = null;
          }
          if (oscillator) {
            try { oscillator.stop(); } catch(e){}
            oscillator = null;
          }
          if (audioCtx) {
            try { audioCtx.close(); } catch(e){}
            audioCtx = null;
          }
        }

        // Bilingual speech warning synthesiser
        var lastSpeechTime = 0;
        function speakWarning() {
          if (silenced) return;
          var now = Date.now();
          if (now - lastSpeechTime < 9000) return; // avoid repeating too fast
          lastSpeechTime = now;

          if ('speechSynthesis' in window) {
            if (currentLang === 'ur') {
              var uUrdu = new SpeechSynthesisUtterance("Warning: Red Zone qareeb hai. Is raaste se parhez karein.");
              uUrdu.rate = 0.9;
              window.speechSynthesis.speak(uUrdu);
            } else {
              var uEng = new SpeechSynthesisUtterance("Warning: Red Zone ahead. Avoid this route.");
              uEng.rate = 0.95;
              window.speechSynthesis.speak(uEng);
            }
          }
        }

        function checkProximity(lat, lng) {
          var closestDist = Infinity;
          var closestThreat = null;

          incidents.forEach(function(inc) {
            var dist = getDistance(lat, lng, inc.lat, inc.lng);
            if (dist < closestDist) {
              closestDist = dist;
              closestThreat = inc;
            }
          });

          var isInside = false;
          if (closestThreat) {
            var rad = closestThreat.affected_radius_m || 1200;
            if (closestDist < rad) {
              isInside = true;
            }
          }

          // Trigger warning alerts
          if (isInside) {
            playSiren();
            speakWarning();
          } else {
            stopSiren();
          }

          // Post threat status details to parent container
          var payload = JSON.stringify({
            type: 'PROXIMITY_UPDATE',
            inside: isInside,
            distance: closestDist === Infinity ? 0 : Math.round(closestDist),
            incidentType: closestThreat ? closestThreat.type : '',
            lat: lat,
            lng: lng
          });

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(payload);
          } else {
            window.parent.postMessage(payload, '*');
          }
        }

        // Proximity calculation on markers drag
        userMarker.on('drag', function(e) {
          var pos = userMarker.getLatLng();
          checkProximity(pos.lat, pos.lng);
        });

        userMarker.on('dragend', function(e) {
          var pos = userMarker.getLatLng();
          checkProximity(pos.lat, pos.lng);
        });

        // Check immediately on mount
        checkProximity(${userLocation.lat}, ${userLocation.lng});

        // Listen for Mute message from React Native parent
        window.addEventListener('message', function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.type === 'MUTE_SIREN') {
              silenced = true;
              stopSiren();
            }
          } catch (e) {}
        });
      </script>
    </body>
    </html>`;
  };

  // Render WebView or fallback iframe
  const renderMap = () => {
    const html = buildHTML();

    if (Platform.OS === 'web') {
      return (
        <iframe
          id="citizen-map-iframe"
          srcDoc={html}
          style={styles.iframe}
          title="Interactive Map"
        />
      );
    }

    // Try loading WebView
    let MapComponent: any = null;
    try {
      MapComponent = require('react-native-webview').WebView;
    } catch {
      MapComponent = null;
    }

    if (MapComponent) {
      return (
        <MapComponent
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(event: any) => handleProximityMessage(event.nativeEvent.data)}
        />
      );
    }

    return (
      <View style={styles.fallbackBox}>
        <Text style={styles.fallbackIcon}>🗺️</Text>
        <Text style={styles.fallbackText}>Active Threat Overlay</Text>
        <Text style={styles.fallbackSub}>
          Location: {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{t.back}</Text>
        </TouchableOpacity>
        
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{t.title}</Text>
          <Text style={styles.titleSubText}>{t.subtitle}</Text>
        </View>

        <View style={styles.langToggleContainer}>
          <TouchableOpacity 
            onPress={() => setLang('en')} 
            style={[styles.langToggleBtn, lang === 'en' && styles.langToggleBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.langToggleText, lang === 'en' && styles.langToggleTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setLang('ur')} 
            style={[styles.langToggleBtn, lang === 'ur' && styles.langToggleBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.langToggleText, lang === 'ur' && styles.langToggleTextActive]}>اردو</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={fetchIncidents}>
          <Text style={styles.syncBtnText}>{t.refresh}</Text>
        </TouchableOpacity>
      </View>

      {/* Threat HUD Panel */}
      <View style={styles.hudCard}>
        {insideZone ? (
          <View style={[styles.hudContent, styles.hudDanger]}>
            <View style={styles.hudHeaderRow}>
              <View style={styles.dangerStrobe} />
              <Text style={styles.dangerTitle}>{t.dangerTitle}</Text>
            </View>
            <Text style={styles.dangerSubText}>
              {t.dangerDesc}
            </Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>{t.nearestHazard}: <Text style={styles.boldText}>{nearestIncidentType}</Text></Text>
              <Text style={styles.statsLabel}>{t.distance}: <Text style={styles.boldText}>{nearestDistance} {t.meters}</Text></Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.actionBtn, sirenSilenced && styles.actionBtnSilenced]} 
              onPress={handleSilenceAlarm}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>
                {sirenSilenced ? t.sirenSilenced : t.silenceSiren}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.hudContent, styles.hudSafe]}>
            <View style={styles.hudHeaderRow}>
              <View style={styles.safePulse} />
              <Text style={styles.safeTitle}>{t.safeTitle}</Text>
            </View>
            <Text style={styles.safeSubText}>
              {t.safeDesc}
            </Text>
            {nearestDistance !== null && nearestDistance !== Infinity && (
              <Text style={styles.infoText}>
                {t.closestThreat}: {nearestIncidentType} ({nearestDistance}m {t.away})
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Interactive Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
        ) : (
          renderMap()
        )}
      </View>

      {/* Safety Advisories Card */}
      <View style={styles.advisoryCard}>
        <Text style={styles.advisoryHeader}>{t.advisoryTitle}</Text>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{t.advisory1}</Text>
        </View>
        <View style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{t.advisory2}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.citizenBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 48,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.citizenBorder,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  titleBox: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.xs,
  },
  titleText: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.citizenText,
  },
  titleSubText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.citizenTextSecondary,
    marginTop: 2,
  },
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.sm,
    padding: 2,
    marginRight: Spacing.sm,
  },
  langToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm - 1,
  },
  langToggleBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  langToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.citizenTextSecondary,
  },
  langToggleTextActive: {
    color: Colors.primary,
  },
  syncBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncBtnText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  hudCard: {
    padding: Spacing.md,
  },
  hudContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  hudDanger: {
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    shadowColor: '#EF4444',
  },
  hudSafe: {
    backgroundColor: 'rgba(236, 253, 245, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10B981',
  },
  hudHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerStrobe: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    marginRight: 10,
  },
  dangerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: '#991B1B',
  },
  dangerSubText: {
    fontSize: Typography.sizes.sm,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  safePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginRight: 10,
  },
  safeTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: '#065F46',
  },
  safeSubText: {
    fontSize: Typography.sizes.sm,
    color: '#065F46',
    lineHeight: 18,
  },
  infoText: {
    fontSize: Typography.sizes.xs,
    color: '#047857',
    fontWeight: '700',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statsLabel: {
    fontSize: Typography.sizes.xs + 1,
    color: '#7F1D1D',
  },
  boldText: {
    fontWeight: '800',
  },
  actionBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionBtnSilenced: {
    backgroundColor: '#94A3B8',
  },
  actionBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: Typography.sizes.sm,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.citizenBorder,
    minHeight: 280,
    backgroundColor: '#E2E8F0',
  },
  spinner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  fallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fallbackIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.citizenText,
  },
  fallbackSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.citizenTextSecondary,
    marginTop: 4,
  },
  advisoryCard: {
    margin: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  advisoryHeader: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.citizenText,
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  bulletDot: {
    color: Colors.primary,
    fontWeight: '800',
    marginRight: 6,
  },
  bulletText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.citizenTextSecondary,
    lineHeight: 16,
    flex: 1,
  },
});
