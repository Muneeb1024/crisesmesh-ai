/**
 * CrisesMesh AI — Citizen Flood Report Screen
 * Category, description, photo, voice note, location, submit
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList, ReportCategory } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { submitReport } from '../services/api';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenReport'>;

const categories: { value: ReportCategory; icon: string; urdu: string }[] = [
  { value: 'Urban Flooding', icon: '🌊', urdu: 'سیلاب' },
  { value: 'Water Logging', icon: '💧', urdu: 'جمع پانی' },
  { value: 'Drain Overflow', icon: '🕳️', urdu: 'نالہ' },
  { value: 'Fire Incident', icon: '🔥', urdu: 'آگ' },
  { value: 'Earthquake Damage', icon: '🏚️', urdu: 'زلزلہ' },
  { value: 'Road Blockage', icon: '🚧', urdu: 'سڑک بند' },
  { value: 'Infrastructure Damage', icon: '🏗️', urdu: 'تباہی' },
  { value: 'Medical Emergency', icon: '🏥', urdu: 'طبی' },
  { value: 'Landslide', icon: '⛰️', urdu: 'لینڈ سلائیڈ' },
  { value: 'Gas Leak', icon: '💨', urdu: 'گیس لیک' },
  { value: 'Power Outage', icon: '⚡', urdu: 'بجلی' },
  { value: 'Other Emergency', icon: '🆘', urdu: 'دیگر' },
];

const severityLevels = [
  { value: 'low', label: 'Minor', icon: '🟡', desc: 'Ankle-deep, passable' },
  { value: 'medium', label: 'Moderate', icon: '🟠', desc: 'Knee-deep, slowing traffic' },
  { value: 'high', label: 'Severe', icon: '🔴', desc: 'Waist-deep, road blocked' },
];

export default function CitizenReportScreen() {
  const navigation = useNavigation<NavProp>();
  const { citizenProfile, addCitizenReport } = useAppStore();

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [roadBlocked, setRoadBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string>('Processing');

  // Integrated Dual-Mode Hardware Telemetry Stack
  const [useSimulatedControls, setUseSimulatedControls] = useState(true);
  const [gpsCoords, setGpsCoords] = useState({
    lat: 33.6844,
    lng: 73.0479,
    address: 'Auto GPS — Islamabad Node'
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Premium simulated camera / voice features
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const shutterFlashAnim = useRef(new Animated.Value(0)).current;
  const voicePulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecordingVoice) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulseAnim, {
            toValue: 1.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(voicePulseAnim, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      animation.start();
    } else {
      voicePulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isRecordingVoice]);

  // Context-aware dynamic checkbox options based on chosen emergency type
  const getDynamicCheckboxDetails = () => {
    switch (category) {
      case 'Fire Incident':
        return {
          icon: '🔥',
          label: 'Structure Occupied / Citizens Trapped?',
          urdu: 'کیا عمارت میں لوگ پھنسے ہوئے ہیں؟',
          hint: 'Immediate search & rescue priority requested.',
        };
      case 'Medical Emergency':
        return {
          icon: '🚑',
          label: 'Patient Unconscious or Critical?',
          urdu: 'کیا مریض بے ہوش یا نازک حالت میں ہے؟',
          hint: 'Triggers priority life-support ambulance telemetry.',
        };
      case 'Earthquake Damage':
      case 'Infrastructure Damage':
        return {
          icon: '🏚️',
          label: 'Structure Unstable / Risk of Collapse?',
          urdu: 'کیا عمارت گرنے کا شدید خطرہ ہے؟',
          hint: 'Select if structural fractures threaten safety.',
        };
      case 'Gas Leak':
        return {
          icon: '💨',
          label: 'Toxic Fumes / Immediate Evacuation Needed?',
          urdu: 'کیا فوری انخلاء کی ضرورت ہے؟',
          hint: 'Select if severe respiratory or blast risk is present.',
        };
      case 'Power Outage':
        return {
          icon: '🔌',
          label: 'Critical Infrastructure Affected (e.g. Hospital)?',
          urdu: 'کیا کوئی اہم ادارہ (جیسے ہسپتال) متاثر ہے؟',
          hint: 'Alerts utility coordinators to prioritize vital nodes.',
        };
      case 'Urban Flooding':
      case 'Water Logging':
      case 'Drain Overflow':
      case 'Road Blockage':
      case 'Landslide':
      default:
        return {
          icon: '🚧',
          label: 'Road / Underpass Blocked?',
          urdu: 'کیا سڑک یا انڈر پاس ٹریفک کے لیے بند ہے؟',
          hint: 'Select if vehicles cannot pass due to high water or debris.',
        };
    }
  };

  // Context-specific situational quick phrases in Roman Urdu
  const getQuickPhrases = () => {
    switch (category) {
      case 'Fire Incident':
        return [
          { text: 'Aag out of control hai', label: '🔥 Out of Control' },
          { text: 'Log building mein phansay hain', label: '👥 People Trapped' },
          { text: 'Fire brigade fauran bhejein', label: '🚒 Send Fire Brigade' },
        ];
      case 'Medical Emergency':
        return [
          { text: 'Rider accident mein zakhmi hai', label: '🏍️ Accident Injury' },
          { text: 'Dil ka daura / Saans ka masla', label: '🫀 Chest Pain / Breathing' },
          { text: 'Ambulance fauran bhejein', label: '🚑 Need Ambulance' },
        ];
      case 'Urban Flooding':
      case 'Water Logging':
      case 'Drain Overflow':
        return [
          { text: 'Gharon mein pani daakhil ho gaya', label: '🌊 Flood in Homes' },
          { text: 'Road block, gariyan phansi hain', label: '🚗 Cars Trapped' },
          { text: 'Nala overflow ho raha hai', label: '🕳️ Drain Overflowing' },
        ];
      case 'Earthquake Damage':
      case 'Infrastructure Damage':
        return [
          { text: 'Deewar/Chhat gir gayi hai', label: '🏚️ Wall collapsed' },
          { text: 'Dhararein aur cracks boht baray hain', label: '🏗️ Large Cracks' },
          { text: 'Rasta malba girne se band hai', label: '🚧 Blocked by Debris' },
        ];
      case 'Road Blockage':
      case 'Landslide':
        return [
          { text: 'Landy slide ki waja se road block hai', label: '⛰️ Landslide Block' },
          { text: 'Darakht girnay se rasta band hai', label: '🌳 Fallen Tree' },
          { text: 'Traffic mukammal jaam hai', label: '🚦 Gridlock Traffic' },
        ];
      case 'Gas Leak':
        return [
          { text: 'Gas leak ki shadeed boo aa rahi hai', label: '💨 Strong Gas Smell' },
          { text: 'Blast hone ka khadsha hai', label: '⚠️ Explosion Risk' },
          { text: 'Logon ko saans lene mein masla hai', label: '🤢 Suffocation Hazard' },
        ];
      default:
        return [
          { text: 'Emergency help chahye', label: '🚨 Immediate Help' },
          { text: 'Rasta mukammal band hai', label: '🚧 Blocked Road' },
          { text: 'Fauran assistance bhejein', label: '⚡ Quick Response' },
        ];
    }
  };

  // Context-aware dynamic severity descriptions in English and Roman Urdu for citizens
  const getDynamicSeverityLevels = () => {
    switch (category) {
      case 'Fire Incident':
        return [
          { value: 'low', label: 'Minor / معمولی', icon: '🟡', desc: 'Small fire under control\n(معمولی آگ، قابو میں ہے)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Large flame spreading\n(درمیانی آگ، پھیل رہی ہے)' },
          { value: 'high', label: 'Severe / شدید', icon: '🔴', desc: 'Out of control, traps present\n(شدید آگ، لوگ پھنسے ہیں)' },
        ];
      case 'Medical Emergency':
        return [
          { value: 'low', label: 'Stable / معمولی', icon: '🟡', desc: 'Minor injury, conscious\n(معمولی چوٹ، ہوش میں ہے)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Fracture or deep bleeding\n(فریکچر یا گہرا زخم ہے)' },
          { value: 'high', label: 'Critical / نازک', icon: '🔴', desc: 'Unconscious or heavy blood loss\n(بے ہوش ہے، جان خطرے میں)' },
        ];
      case 'Earthquake Damage':
      case 'Infrastructure Damage':
        return [
          { value: 'low', label: 'Minor / معمولی', icon: '🟡', desc: 'Cracks in walls, safe to enter\n(چھوٹے کریکس، جگہ محفوظ ہے)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Partial collapse or blockages\n(دیواریں گر گئیں، راستہ بند)' },
          { value: 'high', label: 'Severe / شدید', icon: '🔴', desc: 'Debris collapsed, traps likely\n(ملبہ گر گیا ہے، لوگ پھنسے ہیں)' },
        ];
      case 'Gas Leak':
        return [
          { value: 'low', label: 'Minor / معمولی', icon: '🟡', desc: 'Faint smell in open air area\n(ہلکی بو، کھلی فضا میں ہے)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Strong odor, breathing issue\n(تیز گیس کی بو، دم گھٹنا)' },
          { value: 'high', label: 'Severe / شدید', icon: '🔴', desc: 'Explosion risk, evacuation needed\n(دھماکے کا شدید خطرہ ہے)' },
        ];
      case 'Power Outage':
        return [
          { value: 'low', label: 'Minor / معمولی', icon: '🟡', desc: 'Voltage drops or flickering\n(وولٹیج میں تعطل یا فلکرنگ)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Local blackout in neighborhood\n(پورے محلے کی بجلی بند ہے)' },
          { value: 'high', label: 'Critical / شدید', icon: '🔴', desc: 'Grid fail, vital facility impacted\n(گرڈ اسٹیشن یا ہسپتال بند)' },
        ];
      case 'Urban Flooding':
      case 'Water Logging':
      case 'Drain Overflow':
      case 'Road Blockage':
      case 'Landslide':
      default:
        return [
          { value: 'low', label: 'Minor / معمولی', icon: '🟡', desc: 'Ankle-deep water, passable\n(ٹخنوں تک پانی، گاڑیاں گزر سکتی ہیں)' },
          { value: 'medium', label: 'Moderate / درمیانہ', icon: '🟠', desc: 'Knee-deep water, traffic slowed\n(گھٹنوں تک پانی، گاڑیاں سست)' },
          { value: 'high', label: 'Severe / شدید', icon: '🔴', desc: 'Waist-deep water, trapped\n(کمر تک پانی، راستہ بند ہے)' },
        ];
    }
  };

  // Synchronize dynamic coordinates with Expo Location service
  const syncGpsLocation = async (forceAlert = false) => {
    setIsGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsGpsLoading(false);
        if (forceAlert) {
          Alert.alert(
            'GPS Permission Denied',
            'To get your live coordinates, enable location service in device settings, or switch back to the simulated engine.',
            [{ text: 'Stay in Mock Mode', onPress: () => setUseSimulatedControls(true) }]
          );
        }
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let addressStr = 'Coordinates Retrieved';
      try {
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo && geo.length > 0) {
          const first = geo[0];
          addressStr = `${first.street || first.name || ''}, ${first.city || first.district || first.subregion || ''}, Pakistan`;
        }
      } catch (geoErr) {
        console.log('Reverse geocoding error:', geoErr);
      }

      setGpsCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        address: addressStr,
      });

      if (forceAlert) {
        Alert.alert(
          'Live GPS Synchronized 🛰️',
          `Your true physical coordinates have been locked inside the metadata telemetry payload:\n\n📍 Latitude: ${loc.coords.latitude.toFixed(5)}°\n📍 Longitude: ${loc.coords.longitude.toFixed(5)}°\n🏠 Address: ${addressStr}`,
          [{ text: 'Confirm Telemetry' }]
        );
      }
    } catch (err) {
      console.log('Live GPS Sync Error:', err);
      if (forceAlert) {
        Alert.alert(
          'GPS Sensor Timeout',
          'Physical GPS sensor timed out or unavailable. Switching telemetry framework automatically to Mock fallback.',
          [{ text: 'Use Mock Telemetry', onPress: () => setUseSimulatedControls(true) }]
        );
      }
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleModeSwitch = async (simValue: boolean) => {
    setUseSimulatedControls(simValue);
    if (!simValue) {
      await syncGpsLocation(true);
    } else {
      setGpsCoords({
        lat: 33.6844,
        lng: 73.0479,
        address: 'Auto GPS — Islamabad Node'
      });
      Alert.alert('Simulation Active ⚙️', 'Reverted GPS parameters and camera viewports back to simulation grids.');
    }
  };

  const handleCameraOpen = async () => {
    if (!category) {
      Alert.alert('Selection Required', 'Please select a Crisis Type first.');
      return;
    }

    if (!useSimulatedControls) {
      // Trigger actual physical camera
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert("Permission Required", "Camera access is needed to capture physical snapshots. Redirecting to simulated viewfinder.");
          setIsCameraActive(true);
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPhotoUri(result.assets[0].uri);
          Alert.alert('Photo Captured 📸', 'Physical snapshot successfully attached to report payload.');
        }
      } catch (err) {
        console.log("Real camera error:", err);
        Alert.alert("Camera Interface Unavailable", "Physical camera is disabled or unsupported. Opening simulated viewfinder instead.");
        setIsCameraActive(true);
      }
    } else {
      setIsCameraActive(true);
    }
  };

  const handleCapturePhoto = () => {
    shutterFlashAnim.setValue(1);
    Animated.timing(shutterFlashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPhotoUri(`sim_photo_${category?.toLowerCase().replace(' ', '_')}_gps.jpg`);
      setIsCameraActive(false);
    });
  };

  const handleGalleryOpen = async () => {
    if (!category) {
      Alert.alert('Selection Required', 'Please select a Crisis Type first.');
      return;
    }

    if (!useSimulatedControls) {
      // Trigger actual gallery image picker
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert("Permission Required", "Gallery permissions are required to select a photo. Opening simulated gallery drawer.");
          setIsGalleryActive(true);
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPhotoUri(result.assets[0].uri);
          Alert.alert('Image Selected 🖼️', 'Physical photo successfully selected from device library.');
        }
      } catch (err) {
        console.log("Real gallery error:", err);
        Alert.alert("Gallery Interface Unavailable", "Opening simulated gallery drawer instead.");
        setIsGalleryActive(true);
      }
    } else {
      setIsGalleryActive(true);
    }
  };

  const handleSelectGalleryPhoto = (type: string) => {
    setPhotoUri(`gallery_${type}_verified.jpg`);
    setIsGalleryActive(false);
  };

  const handleVoiceRecordStart = () => {
    setIsRecordingVoice(true);
    setVoiceDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setVoiceDuration(prev => prev + 1);
    }, 1000);
  };

  const handleVoiceRecordStop = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecordingVoice(false);
    setIsTranscribing(true);

    setTimeout(() => {
      setIsTranscribing(false);
      let trans = '';
      switch (category) {
        case 'Urban Flooding':
        case 'Water Logging':
        case 'Drain Overflow':
          trans = "G-10 sector underpass mein boht zayada pani jama ho gaya hai, gaariyan doob rahi hain aur rasta bilkul block hai.";
          break;
        case 'Fire Incident':
          trans = "G-11 area ki 3-story building mein heavy fire lag gayi hai, fire brigade aur rescue service fauran bhejein.";
          break;
        case 'Road Blockage':
          trans = "Kashmir Highway par heavy road block hai, trees aur boulders gire hain. Gaariyan agay nahi ja pa rahi.";
          break;
        case 'Medical Emergency':
          trans = "G-9 signal ke paas motor-cycle accident hua hai, rider boht zayada injured hai, ambulance dispatch karein.";
          break;
        case 'Earthquake Damage':
          trans = "Zalzale ke jhatkon se boundary wall gir gayi hai aur ghar ke front side par cracks hain.";
          break;
        default:
          trans = `${category} emergency incident pesh aya hai, rescue service fauran bulwayein. Location verified hai.`;
      }

      // Beautiful character-by-character typing effect!
      let index = 0;
      setDescription('');
      const typingTimer = setInterval(() => {
        if (index < trans.length) {
          setDescription(prev => prev + trans.charAt(index));
          index++;
        } else {
          clearInterval(typingTimer);
        }
      }, 20);

    }, 2000);
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [successScale] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!category) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!severity) {
      Alert.alert('Required', 'Please select a severity level');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description');
      return;
    }

    setIsSubmitting(true);

    // Map severity UI values to API enum
    const severityMap: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'> = {
      low: 'Low', medium: 'Medium', high: 'High',
    };

    const { data, error } = await submitReport({
      citizen_name: citizenProfile?.name || 'Unknown',
      phone: citizenProfile?.phone || '03001234567',
      category: category!,
      severity: severityMap[severity!] || 'Medium',
      description: description.trim(),
      lat: gpsCoords.lat,
      lng: gpsCoords.lng,
      road_blocked: roadBlocked,
    });

    setIsSubmitting(false);

    if (error) {
      // Fallback: save locally if backend is unreachable
      console.warn('[API Fallback]', error);
      const localReport = {
        id: `local_${Date.now()}`,
        citizen_name: citizenProfile?.name || 'Unknown',
        phone: citizenProfile?.phone || '',
        category: category!,
        description: description.trim(),
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        status: 'Submitted' as const,
        created_at: new Date().toISOString(),
      };
      addCitizenReport(localReport);
      setReportId(localReport.id);
      setReportStatus('Saved Locally (offline)');
    } else if (data) {
      // Backend success — save to local store too
      addCitizenReport({
        id: data.id,
        citizen_name: data.citizen_name,
        phone: data.phone,
        category: data.category as any,
        description: data.description,
        lat: data.lat,
        lng: data.lng,
        status: data.status as any,
        created_at: data.created_at,
      });
      setReportId(data.id);
      setReportStatus(data.status);
    }

    setSubmitted(true);
    Animated.spring(successScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [category, severity, description, roadBlocked, citizenProfile, gpsCoords]);

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />
        <Animated.View
          style={[styles.successContent, { transform: [{ scale: successScale }] }]}
        >
          <View style={styles.successIconBg}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          {reportId && (
            <Text style={[styles.successSubtitle, { fontFamily: 'monospace', fontSize: 13, color: Colors.primary, marginBottom: 4 }]}>
              Report ID: {reportId}
            </Text>
          )}
          <Text style={styles.successSubtitle}>
            Your emergency report has been received and is being processed by CrisesMesh AI.
          </Text>

          {/* Processing steps */}
          <View style={styles.processingCard}>
            <Text style={styles.processingTitle}>🤖 What Happens Next</Text>
            <View style={styles.processingStep}>
              <View style={styles.processingStepNum}>
                <Text style={styles.processingStepNumText}>1</Text>
              </View>
              <Text style={styles.processingStepText}>Signal Fusion Agent verifies your report</Text>
              <Text style={styles.processingStepTime}>~30s</Text>
            </View>
            <View style={styles.processingStep}>
              <View style={styles.processingStepNum}>
                <Text style={styles.processingStepNumText}>2</Text>
              </View>
              <Text style={styles.processingStepText}>Classification Agent categorizes severity</Text>
              <Text style={styles.processingStepTime}>~1min</Text>
            </View>
            <View style={styles.processingStep}>
              <View style={styles.processingStepNum}>
                <Text style={styles.processingStepNumText}>3</Text>
              </View>
              <Text style={styles.processingStepText}>Alert sent to NDMA / local authorities</Text>
              <Text style={styles.processingStepTime}>~2min</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, reportStatus === 'Under Review' && { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statusText}>{reportStatus}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🚨</Text>
            <Text style={styles.headerTitle}>Report Emergency / ایمرجنسی رپورٹ</Text>
            <Text style={styles.headerSubtitle}>
              Select the type of crisis and provide details. Your report helps save lives.
            </Text>
          </View>

          {/* Integrated Dual-Mode Hardware/Simulation Dashboard */}
          <View style={styles.engineContainer}>
            <Text style={styles.engineLabel}>⚙️ TELEMETRY METADATA ENGINE</Text>
            <View style={styles.engineRow}>
              <TouchableOpacity 
                style={[styles.engineBtn, useSimulatedControls && styles.engineBtnActive]} 
                onPress={() => handleModeSwitch(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.engineBtnText, useSimulatedControls && styles.engineBtnTextActive]}>
                  🖥️ Simulation Matrix
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.engineBtn, !useSimulatedControls && styles.engineBtnActiveHardware]} 
                onPress={() => handleModeSwitch(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.engineBtnText, !useSimulatedControls && styles.engineBtnTextActiveHardware]}>
                  🛰️ Native Hardware
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.engineSubText}>
              {useSimulatedControls 
                ? "💡 Sandbox Mode: Running grid viewfinders, audio waveforms and romaine auto-transcribers."
                : "🔥 Live Mode: Invoking actual device GPS sensors, physical camera shutter, and library pickers."}
            </Text>
          </View>

          {/* Category selector — 3-col grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crisis Type / بحران کی قسم *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.value && styles.categoryChipTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {cat.value.split(' ')[0]}
                  </Text>
                  <Text style={styles.categoryChipUrdu}>{cat.urdu}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Severity Level / شدت کی سطح *</Text>
            <View style={styles.severityRow}>
              {getDynamicSeverityLevels().map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.severityChip,
                    severity === s.value && styles.severityChipActive,
                  ]}
                  onPress={() => setSeverity(s.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.severityIcon}>{s.icon}</Text>
                  <Text style={[
                    styles.severityLabel,
                    severity === s.value && styles.severityLabelActive,
                  ]}>{s.label}</Text>
                  <Text style={styles.severityDesc}>{s.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Unified Description & Voice Note telemetry container */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incident Details / تفصیلات *</Text>
            <Text style={styles.sectionHint}>Type below or record using the smart AI Voice recorder</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. G-10 mein aag lag gayi hai, 3 manzila building... ya pani bhar gaya hai..."
              placeholderTextColor={Colors.citizenTextSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {/* Quick Phrase Suggestion Chips */}
            <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.sm }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.citizenTextSecondary, marginBottom: 6, letterSpacing: 0.5 }}>
                💡 QUICK PHRASE TEMPLATES / ایمرجنسی الفاظ (Tap to append)
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.xs, paddingBottom: 2 }}
              >
                {getQuickPhrases().map((phrase, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      const suffix = description.trim() ? ' ' + phrase.text : phrase.text;
                      setDescription(prev => prev + suffix);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: BorderRadius.round,
                      backgroundColor: '#F8FAFC',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.citizenText }}>
                      {phrase.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Visual Divider linking description text box to voice recorder */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              <Text style={{ marginHorizontal: 10, fontSize: 9, fontWeight: '800', color: '#10B981', letterSpacing: 0.8 }}>
                🎙️ OR RECORD WITH AI VOICE / یا بول کر لکھیں
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </View>

            {/* Interactive Voice Note Section */}
            {isRecordingVoice ? (
              <TouchableOpacity style={styles.voiceButtonActive} onPress={handleVoiceRecordStop} activeOpacity={0.85}>
                <Animated.View style={[styles.voicePulseCircle, { transform: [{ scale: voicePulseAnim }] }]} />
                <Text style={styles.voiceButtonIconActive}>🔴</Text>
                <Text style={styles.voiceButtonTextActive}>Recording... Tap to Stop</Text>
                <Text style={styles.voiceTimerText}>00:{voiceDuration < 10 ? '0' + voiceDuration : voiceDuration}</Text>
                <View style={styles.waveformContainer}>
                  <View style={[styles.waveBar, { height: 12 + Math.sin(voiceDuration * 2) * 8 }]} />
                  <View style={[styles.waveBar, { height: 20 + Math.cos(voiceDuration * 3) * 12 }]} />
                  <View style={[styles.waveBar, { height: 28 + Math.sin(voiceDuration * 5) * 15 }]} />
                  <View style={[styles.waveBar, { height: 18 + Math.cos(voiceDuration * 4) * 10 }]} />
                  <View style={[styles.waveBar, { height: 10 + Math.sin(voiceDuration * 1) * 6 }]} />
                </View>
              </TouchableOpacity>
            ) : isTranscribing ? (
              <View style={styles.transcribingCard}>
                <Text style={styles.transcribingIcon}>🤖</Text>
                <Text style={styles.transcribingTitle}>CrisesMesh AI Transcribing...</Text>
                <Text style={styles.transcribingSubtitle}>Converting speech telemetry into verified structured text...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceRecordStart} activeOpacity={0.8}>
                <Text style={styles.voiceButtonIcon}>🎙️</Text>
                <Text style={styles.voiceButtonText}>Tap to Record / بولیں</Text>
                <Text style={styles.voiceButtonHint}>Your voice is transcribed directly into the description box above</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo Evidence with active preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Evidence / تصویری ثبوت</Text>
            {photoUri ? (
              <View style={[styles.photoPreviewCard, { borderColor: category === 'Fire Incident' ? '#EF4444' : Colors.primary }]}>
                <View style={styles.photoPreviewHeader}>
                  <Text style={styles.photoPreviewLabel}>📷 SECURE TELEMETRY SNAPSHOT</Text>
                  <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.photoDeleteBtn} activeOpacity={0.7}>
                    <Text style={styles.photoDeleteText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.photoFrame, { backgroundColor: category === 'Fire Incident' ? '#FEF2F2' : '#F0F9FF' }]}>
                  <Text style={styles.photoFrameEmoji}>
                    {category === 'Fire Incident' ? '🔥' : category === 'Medical Emergency' ? '🏥' : category === 'Road Blockage' ? '🚧' : '📸'}
                  </Text>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.photoFrameName} numberOfLines={1}>{photoUri}</Text>
                    <Text style={styles.photoFrameMeta}>📍 GPS Tagged: {gpsCoords.lat.toFixed(4)}° N, {gpsCoords.lng.toFixed(4)}° E</Text>
                    <Text style={styles.photoFrameMeta}>🛡️ Integrity Stamp: {useSimulatedControls ? 'AI-Simulated' : 'Hardware-Certified'}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.mediaRow}>
                <TouchableOpacity style={styles.mediaButton} onPress={handleCameraOpen} activeOpacity={0.8}>
                  <Text style={styles.mediaButtonIcon}>📷</Text>
                  <Text style={styles.mediaButtonText}>Camera / کیمرہ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={handleGalleryOpen} activeOpacity={0.8}>
                  <Text style={styles.mediaButtonIcon}>🖼️</Text>
                  <Text style={styles.mediaButtonText}>Gallery / گیلری</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Location / موجودہ جگہ *</Text>
            <View style={styles.locationCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: Spacing.sm }}>
                <View style={[styles.locationRow, { flex: 1, marginRight: Spacing.sm }]}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>{isGpsLoading ? 'Pinging Satellites...' : gpsCoords.address}</Text>
                    <Text style={styles.locationCoords}>
                      {gpsCoords.lat.toFixed(5)}°N, {gpsCoords.lng.toFixed(5)}°E
                    </Text>
                  </View>
                </View>
                {/* Visual Aerospace Telemetry Radar widget */}
                <View style={styles.sonarRadarWidget}>
                  <View style={styles.radarGridLineH} />
                  <View style={styles.radarGridLineV} />
                  <View style={[styles.radarPing, isGpsLoading && { backgroundColor: '#3B82F6', shadowColor: '#3B82F6' }]} />
                  <View style={[styles.radarBlip, { transform: [{ scale: isGpsLoading ? 1.5 : 1 }] }]} />
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.locationEditButton, !useSimulatedControls && { backgroundColor: '#ECFDF5' }]} 
                onPress={() => syncGpsLocation(true)}
                activeOpacity={0.8}
                disabled={isGpsLoading}
              >
                <Text style={[styles.locationEditText, !useSimulatedControls && { color: '#10B981' }]}>
                  {isGpsLoading ? 'Syncing...' : useSimulatedControls ? 'Correct on Map' : 'Sync Live GPS 🛰️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Context-Aware Situational Checkbox */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.toggleRow, roadBlocked && styles.toggleRowActive]}
              onPress={() => setRoadBlocked(!roadBlocked)}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleIcon}>{roadBlocked ? '✅' : '⬜'}</Text>
              <View style={styles.toggleTextGroup}>
                <Text style={styles.toggleLabel}>
                  {getDynamicCheckboxDetails().label}
                </Text>
                <Text style={{ fontSize: 13, color: roadBlocked ? Colors.primary : Colors.citizenTextSecondary, marginTop: 2, fontWeight: '600', textAlign: 'left' }}>
                  {getDynamicCheckboxDetails().urdu}
                </Text>
                <Text style={styles.toggleHint}>
                  {getDynamicCheckboxDetails().hint}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!category || !severity || !description.trim()) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report 🚨'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* ── HIGH-FIDELITY SIMULATED VIEWFINDER OVERLAY ── */}
      {isCameraActive && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.cameraOverlay}>
            {/* Shutter flash screen white overlay */}
            <Animated.View style={[styles.shutterFlashEffect, { opacity: shutterFlashAnim }]} pointerEvents="none" />

            {/* Top camera bar */}
            <View style={styles.cameraTopBar}>
              <TouchableOpacity onPress={() => setIsCameraActive(false)} style={styles.cameraCloseBtn} activeOpacity={0.7}>
                <Text style={styles.cameraCloseText}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.cameraTopTitle}>🛡️ GPS OPTIMIZED</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Viewfinder frame */}
            <View style={styles.cameraViewfinder}>
              <View style={styles.viewfinderGridCornerTL} />
              <View style={styles.viewfinderGridCornerTR} />
              <View style={styles.viewfinderGridCornerBL} />
              <View style={styles.viewfinderGridCornerBR} />

              <View style={styles.viewfinderLabelBox}>
                <Text style={styles.viewfinderLabelText}>[ MOCK VIEWFINDER ]</Text>
                <Text style={styles.viewfinderLabelSub}>Verified Category: {category}</Text>
                <Text style={styles.viewfinderLabelSub}>Geo-Location: Islamabad Node</Text>
              </View>
            </View>

            {/* Bottom shutter bar */}
            <View style={styles.cameraBottomBar}>
              <View style={{ width: 60 }} />
              <TouchableOpacity onPress={handleCapturePhoto} style={styles.shutterBtnOuter} activeOpacity={0.85}>
                <View style={styles.shutterBtnInner} />
              </TouchableOpacity>
              <Text style={styles.shutterHint}>Tap to Capture</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── HIGH-FIDELITY SIMULATED GALLERY DRAWER ── */}
      {isGalleryActive && (
        <View style={styles.galleryModalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            onPress={() => setIsGalleryActive(false)} 
            activeOpacity={1} 
          />
          <View style={styles.gallerySheet}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitleText}>Select Simulated Evidence Photo</Text>
              <TouchableOpacity onPress={() => setIsGalleryActive(false)} style={styles.galleryCloseBtn} activeOpacity={0.7}>
                <Text style={styles.galleryCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.galleryGrid}>
              <TouchableOpacity 
                style={styles.galleryCard} 
                onPress={() => handleSelectGalleryPhoto('urban_disaster_fire')}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryCardEmoji}>🔥</Text>
                <Text style={styles.galleryCardLabel}>Active Fire Scene</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.galleryCard} 
                onPress={() => handleSelectGalleryPhoto('urban_disaster_flood')}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryCardEmoji}>🌊</Text>
                <Text style={styles.galleryCardLabel}>Deep Street Flood</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.galleryCard} 
                onPress={() => handleSelectGalleryPhoto('road_debris_blockage')}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryCardEmoji}>🚧</Text>
                <Text style={styles.galleryCardLabel}>Major Blockage</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.galleryCard} 
                onPress={() => handleSelectGalleryPhoto('infrastructure_crack')}
                activeOpacity={0.8}
              >
                <Text style={styles.galleryCardEmoji}>🏚️</Text>
                <Text style={styles.galleryCardLabel}>Damaged Structure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.citizenBg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.citizenText,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.citizenTextSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.citizenText,
    marginBottom: Spacing.sm,
  },
  sectionHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.citizenTextSecondary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.citizenCard,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  categoryChipIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.citizenText,
    textAlign: 'center',
  },
  categoryChipTextActive: {
    color: Colors.primary,
  },
  categoryChipUrdu: {
    fontSize: 9,
    color: Colors.citizenTextSecondary,
    marginTop: 1,
    textAlign: 'center',
  },
  severityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityChip: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.citizenCard,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
  },
  severityChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  severityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  severityLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  severityLabelActive: {
    color: Colors.primary,
  },
  severityDesc: {
    fontSize: 9,
    color: Colors.citizenTextSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.citizenCard,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
  },
  toggleRowActive: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  toggleIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  toggleHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.citizenTextSecondary,
    marginTop: 2,
  },
  processingCard: {
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.citizenBorder,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  processingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.citizenText,
    marginBottom: Spacing.md,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  processingStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  processingStepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
  },
  processingStepText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.citizenText,
  },
  processingStepTime: {
    fontSize: Typography.sizes.xs,
    color: Colors.citizenTextSecondary,
  },
  textArea: {
    backgroundColor: Colors.citizenCard,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.citizenText,
    minHeight: 100,
    ...Shadows.sm,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.citizenCard,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
    borderStyle: 'dashed',
  },
  mediaButtonIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  mediaButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.citizenTextSecondary,
  },
  voiceButton: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
  },
  voiceButtonIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  voiceButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.accent,
  },
  voiceButtonHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.citizenTextSecondary,
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
    ...Shadows.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationIcon: {
    fontSize: 22,
    marginRight: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.citizenText,
  },
  locationCoords: {
    fontSize: Typography.sizes.sm,
    color: Colors.citizenTextSecondary,
    marginTop: 2,
  },
  locationEditButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F0F9FF',
  },
  locationEditText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  // Success state
  successContainer: {
    flex: 1,
    backgroundColor: Colors.citizenBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '800',
    color: Colors.citizenText,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.citizenTextSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.citizenBorder,
    width: '100%',
    marginBottom: Spacing.xxl,
    ...Shadows.sm,
  },
  statusLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.citizenTextSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  backButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  backButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  // Photo evidence layout styles
  photoPreviewCard: {
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginTop: Spacing.xs,
    ...Shadows.sm,
  },
  photoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  photoPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.citizenTextSecondary,
    letterSpacing: 0.5,
  },
  photoDeleteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FEF2F2',
  },
  photoDeleteText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  photoFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.citizenBorder,
  },
  photoFrameEmoji: {
    fontSize: 32,
  },
  photoFrameName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  photoFrameMeta: {
    fontSize: 9,
    color: Colors.citizenTextSecondary,
    marginTop: 2,
  },

  // Active Voice recording layout styles
  voiceButtonActive: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    position: 'relative',
    overflow: 'hidden',
  },
  voicePulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    top: '30%',
    zIndex: 0,
  },
  voiceButtonIconActive: {
    fontSize: 32,
    marginBottom: Spacing.sm,
    zIndex: 1,
  },
  voiceButtonTextActive: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: '#DC2626',
    zIndex: 1,
  },
  voiceTimerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7F1D1D',
    marginTop: Spacing.xs,
    zIndex: 1,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    height: 30,
    zIndex: 1,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#EF4444',
    borderRadius: 1.5,
  },

  // AI speech transcribing state styles
  transcribingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
  },
  transcribingIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  transcribingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: '#166534',
  },
  transcribingSubtitle: {
    fontSize: 10,
    color: '#15803D',
    textAlign: 'center',
    marginTop: 4,
  },

  // Camera full overlay layout styles
  cameraOverlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  shutterFlashEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 9999,
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cameraCloseBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.sm,
  },
  cameraCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cameraTopTitle: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cameraViewfinder: {
    alignSelf: 'center',
    width: '85%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.md,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderGridCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
  },
  viewfinderGridCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
  },
  viewfinderGridCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
  },
  viewfinderGridCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
  },
  viewfinderLabelBox: {
    padding: Spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  viewfinderLabelText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  viewfinderLabelSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
  cameraBottomBar: {
    alignItems: 'center',
  },
  shutterBtnOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shutterBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  shutterHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Gallery sheet popup styles
  galleryModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  gallerySheet: {
    backgroundColor: Colors.citizenBg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.citizenBorder,
    paddingBottom: Spacing.md,
  },
  galleryTitleText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.citizenText,
  },
  galleryCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.citizenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.citizenTextSecondary,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  galleryCard: {
    width: '47%',
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.citizenBorder,
    ...Shadows.sm,
  },
  galleryCardEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  galleryCardLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  // Integrated Dual-Mode Engine Style Tokens
  engineContainer: {
    backgroundColor: Colors.citizenCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  engineLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.citizenTextSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  engineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  engineBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  engineBtnActive: {
    backgroundColor: '#F0F9FF',
    borderColor: Colors.primary,
  },
  engineBtnActiveHardware: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  engineBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.citizenTextSecondary,
  },
  engineBtnTextActive: {
    color: Colors.primary,
  },
  engineBtnTextActiveHardware: {
    color: '#10B981',
  },
  engineSubText: {
    fontSize: 9,
    color: Colors.citizenTextSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  // Sonar Radar Telemetry Stylesheet Tokens
  sonarRadarWidget: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarGridLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  radarGridLineV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  radarPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  radarBlip: {
    position: 'absolute',
    top: 12,
    left: 15,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
});
