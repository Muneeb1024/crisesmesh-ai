import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../constants/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SignalFusion'>;

export default function SignalFusionScreen() {
  const navigation = useNavigation<NavProp>();
  
  // Matrix pulse animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    Animated.timing(loadAnim, { toValue: 1, duration: 1500, useNativeDriver: false }).start();
  }, [pulseAnim, loadAnim]);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🧠 MULTI-MODAL 8-SIGNAL FUSION CORE</Text>
        <Animated.View style={[s.liveDot, { transform: [{ scale: pulseAnim }] }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.grid}>
        
        {/* PANEL 1: CITIZEN APP */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>1. CITIZEN PORTAL (DIRECT API)</Text>
          <View style={s.panelContent}>
            <Text style={s.log}>[10:41] 💬 "Water entering house in G-10"</Text>
            <Text style={s.log}>[10:42] 🖼️ (Image Payload) High-res flood photo</Text>
            <Text style={s.log}>[10:42] 🎤 (Audio Transcript) "Please send help!"</Text>
          </View>
        </View>

        {/* PANEL 2: WEATHER API */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>2. OPEN-METEO SATELLITE</Text>
          <View style={s.panelContent}>
            <Text style={s.metricLabel}>PRECIPITATION RATE</Text>
            <Text style={s.metricValue}>12.4 mm/hr</Text>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '85%'] }) }]} />
            </View>
            <Text style={s.metricLabel}>AMBIENT TEMP: <Text style={{color:'#FFF'}}>22.1°C</Text></Text>
          </View>
        </View>

        {/* PANEL 3: SOCIAL FIREHOSE */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>3. SOCIAL MEDIA (LLM SIMULATED)</Text>
          <View style={s.panelContent}>
            <Text style={s.log}>🐦 @user12: "Kashmir Hwy is completely blocked!"</Text>
            <Text style={s.log}>🐦 @citizen_9: "Is the bridge safe? Looks bad #ISB"</Text>
            <Text style={[s.log, {color: '#FFB300'}]}>⚠️ ANOMALY CLUSTER: 42 mentions in 3 mins</Text>
          </View>
        </View>

        {/* PANEL 4: IOT SENSORS */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>4. IOT SMART CITY SENSORS</Text>
          <View style={s.panelContent}>
            <Text style={s.metricLabel}>NULLAH LEI WATER LEVEL</Text>
            <Text style={[s.metricValue, {color:'#22C55E'}]}>+0.1m (NORMAL)</Text>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '10%'] }), backgroundColor: '#22C55E' }]} />
            </View>
          </View>
        </View>

        {/* PANEL 5: TRAFFIC ROUTING */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>5. TRAFFIC ROUTING API</Text>
          <View style={s.panelContent}>
            <Text style={s.log}>🚗 SECTOR F-8: <Text style={{color:'#22C55E'}}>45 km/h</Text></Text>
            <Text style={s.log}>🚗 KASHMIR HWY: <Text style={{color:'#22C55E'}}>42 km/h</Text></Text>
            <Text style={s.log}>🚗 G-10 MARKAZ: <Text style={{color:'#FF003C'}}>12 km/h (BOTTLENECK)</Text></Text>
          </View>
        </View>

        {/* PANEL 6: 1122 DISPATCH */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>6. 1122 DISPATCH (META)</Text>
          <View style={s.panelContent}>
            <Text style={s.metricLabel}>SECTOR G-10 CALL VOLUME</Text>
            <Text style={[s.metricValue, {color: '#FF003C'}]}>+400% SPIKE</Text>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, { width: loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '95%'] }), backgroundColor: '#FF003C' }]} />
            </View>
          </View>
        </View>

        {/* PANEL 7: HOSPITAL CAPACITY */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>7. HOSPITAL ER BEDS</Text>
          <View style={s.panelContent}>
            <Text style={s.log}>🏥 PIMS ER: <Text style={{color:'#FFB300'}}>8 BEDS REMAINING</Text></Text>
            <Text style={s.log}>🏥 POLYCLINIC: <Text style={{color:'#22C55E'}}>24 BEDS REMAINING</Text></Text>
          </View>
        </View>

        {/* PANEL 8: DRONE / CCTV */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>8. AUTOMATED DRONE / CCTV FEED</Text>
          <View style={s.panelContent}>
            <Text style={s.log}>🚁 DRONE-04: Dispatching to G-10...</Text>
            <Text style={s.log}>📷 CCTV-ZERO-POINT: Visual clear.</Text>
            <Text style={s.log}>🧠 VISION-AI: Confirmed deep water at Street 14.</Text>
          </View>
        </View>

        {/* FUSION VERDICT */}
        <View style={s.fusionEngineBox}>
          <Text style={s.fusionTitle}>⚡ FUSION ENGINE VERDICT ⚡</Text>
          <Text style={s.fusionText}>
            The Signal Agent cross-referenced Social Media (Panel 3) claiming a bridge collapse with Traffic API (Panel 5) and IoT (Panel 4). 
            Contradiction found. Social panic dismissed as misinformation.
          </Text>
          <Text style={[s.fusionText, { marginTop: 10, color: '#FF003C' }]}>
            However, Citizen Portal (Panel 1) + Weather API (Panel 2) + 1122 (Panel 6) confirm a verified Urban Flood Crisis in Sector G-10.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#050B14', padding: 16, paddingTop: 50, borderBottomWidth: 2, borderColor: '#00E5FF', shadowColor: '#00E5FF', shadowOpacity: 0.8, shadowRadius: 15 },
  backBtn: { marginRight: 15 },
  backText: { color: '#00E5FF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#00E5FF', fontSize: 14, fontWeight: '900', fontFamily: 'monospace', flex: 1, textShadowColor: '#00E5FF', textShadowRadius: 10 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF003C', shadowColor: '#FF003C', shadowOpacity: 1, shadowRadius: 10 },
  scroll: { flex: 1 },
  grid: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  panel: { width: '48%', backgroundColor: 'rgba(0, 229, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)', borderRadius: 8, padding: 10, marginBottom: 12 },
  panelTitle: { color: '#00E5FF', fontSize: 9, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 229, 255, 0.2)', paddingBottom: 4 },
  panelContent: { gap: 6 },
  log: { color: '#94A3B8', fontSize: 9, fontFamily: 'monospace', marginBottom: 2 },
  metricLabel: { color: '#64748B', fontSize: 8, fontWeight: 'bold', fontFamily: 'monospace' },
  metricValue: { color: '#00E5FF', fontSize: 16, fontWeight: '900', fontFamily: 'monospace' },
  barTrack: { height: 4, backgroundColor: '#1E293B', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#00E5FF' },
  fusionEngineBox: { width: '100%', backgroundColor: 'rgba(255, 0, 60, 0.1)', borderWidth: 1, borderColor: '#FF003C', borderRadius: 8, padding: 16, marginTop: 10, marginBottom: 40 },
  fusionTitle: { color: '#FF003C', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', marginBottom: 10 },
  fusionText: { color: '#E2E8F0', fontSize: 11, fontFamily: 'monospace', lineHeight: 18, textAlign: 'center' }
});
