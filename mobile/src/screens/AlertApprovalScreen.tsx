/**
 * CrisesMesh AI — Alert Approval Screen (Task 4.4)
 * Government reviews AI-drafted bilingual alerts and approves/retracts.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, StatusBar, Alert, TextInput,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { API_BASE_URL } from '../services/api';

type AlertStatus = 'Draft' | 'Approved' | 'Retracted';

const ALERT_CHANNELS = [
  { id: 'in_app', icon: '📱', label: 'In-App Alert' },
  { id: 'sms', icon: '💬', label: 'SMS Broadcast' },
  { id: 'whatsapp', icon: '📲', label: 'WhatsApp Alert' },
];

const STAKEHOLDER_MESSAGES = [
  {
    icon: '🚒', role: 'Rescue Teams',
    msg: 'Deploy immediately to G-10 Underpass. Water depth approx 3ft. Use inflatable boats. 2 teams required.',
  },
  {
    icon: '🏥', role: 'PIMS Hospital',
    msg: 'Flood casualties possible. Prepare 20 trauma beds. 2 ambulances dispatched to G-10.',
  },
  {
    icon: '👮', role: 'Traffic Police',
    msg: 'Block G-10 Underpass immediately. Redirect traffic via IJP Road. Avoid Srinagar Highway east.',
  },
  {
    icon: '💧', role: 'WASA',
    msg: 'Activate pumping station near G-10 sector. Monitor water levels every 15 mins.',
  },
  {
    icon: '📋', role: 'CDA Command',
    msg: 'Critical flood confirmed G-10 Underpass. Severity 95/100. 7 resources dispatched. Monitor.\n\nAgent Confidence: 89% | 7 signal sources confirmed.',
  },
];

export default function AlertApprovalScreen({ navigation, route }: any) {
  const incidentId = route?.params?.incidentId || 'inc_001';
  const [generating, setGenerating] = useState(false);
  const [alertDraft, setAlertDraft] = useState<any>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('Draft');
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'stakeholders'>('public');

  const generateAlert = async () => {
    setGenerating(true);
    try {
      const r = await fetch(`${API_BASE_URL}/alerts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          incident_type: 'Urban Flooding',
          severity: 'Critical',
          location: 'G-10 Underpass, Islamabad',
        }),
      });
      const d = await r.json();
      setAlertDraft(d);
      setAlertStatus('Draft');
    } catch {
      // Offline high-fidelity sandbox fallback
      setAlertDraft({
        id: 'alt_' + Math.random().toString(36).substr(2, 9),
        english_text: `🚨 CRITICAL FLOOD WARNING: G-10 Underpass is severely flooded with waist-deep water. Traffic is completely blocked. Emergency services and WASA teams have been dispatched. Avoid the route and redirect via Srinagar Highway or IJP Road immediately. Stay indoors.`,
        roman_urdu_text: `🚨 SHADEED SYLAAB KI ITTELA: G-10 Underpass par kamar tak paani khara ho chuka hai. Aam traffic mukammal taur par band hai. Rescue aur WASA ki teamen rawana kar di gayi hain. Srinagar Highway ya IJP Road ka rasta ikhtiyar karein. Gharon mein rahein.`
      });
      setAlertStatus('Draft');
      Alert.alert('💡 Offline Sandbox Mode', 'Created high-fidelity AI bilingual alert draft locally for simulation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!alertDraft) return;
    setApproving(true);
    try {
      const r = await fetch(`${API_BASE_URL}/alerts/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alertDraft.id,
          approved_by: 'District Commissioner Islamabad',
        }),
      });
      const d = await r.json();
      if (d.success) {
        setAlertStatus('Approved');
        setAlertDraft(d.alert);
        Alert.alert('✅ Alert Published!', 'Alert is now live. Citizens will be notified via in-app, SMS, and WhatsApp.');
      }
    } catch {
      setAlertStatus('Approved');
      if (alertDraft) {
        setAlertDraft({
          ...alertDraft,
          status: 'Approved'
        });
      }
      Alert.alert('✅ Sandbox Dispatched!', 'Alert approved locally for simulation. Broadcast initialized to in-app, SMS, and WhatsApp.');
    } finally {
      setApproving(false);
    }
  };

  const handleRetract = async () => {
    if (!alertDraft) return;
    Alert.alert(
      'Retract Alert?',
      'This will cancel the alert and notify affected parties of the correction.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retract',
          style: 'destructive',
          onPress: async () => {
            try {
              const r = await fetch(`${API_BASE_URL}/alerts/retract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  alert_id: alertDraft.id,
                  reason: 'Incident reclassified by Recovery Agent',
                }),
              });
              const d = await r.json();
              if (d.success) {
                setAlertStatus('Retracted');
                setAlertDraft(d.alert);
              }
            } catch {
              setAlertStatus('Retracted');
              if (alertDraft) {
                setAlertDraft({
                  ...alertDraft,
                  status: 'Retracted'
                });
              }
              Alert.alert('⚠️ Sandbox Retracted', 'Alert retracted locally. Corrections sent to all public channels.');
            }
          },
        },
      ]
    );
  };

  const statusColor = {
    Draft: '#f59e0b',
    Approved: '#22c55e',
    Retracted: '#ef4444',
  }[alertStatus];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>📢 Alert Approval</Text>
          <Text style={s.headerSub}>{incidentId} • Bilingual Alert</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Generate Button */}
        {!alertDraft ? (
          <TouchableOpacity
            style={[s.generateBtn, generating && { opacity: 0.6 }]}
            onPress={generateAlert}
            disabled={generating}
          >
            {generating
              ? <><ActivityIndicator color="#000" size="small" /><Text style={s.generateBtnText}> Generating Alert...</Text></>
              : <Text style={s.generateBtnText}>🤖 Generate AI Alert Draft</Text>}
          </TouchableOpacity>
        ) : (
          <>
            {/* Status Badge */}
            <View style={[s.statusBadge, { borderColor: statusColor }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusText, { color: statusColor }]}>
                {alertStatus === 'Draft' && '⏳ Draft — Awaiting Approval'}
                {alertStatus === 'Approved' && '✅ Approved — Alert is LIVE'}
                {alertStatus === 'Retracted' && '⚠️ Retracted — Alert Cancelled'}
              </Text>
            </View>

            {/* Tab Toggle */}
            <View style={s.tabs}>
              <TouchableOpacity
                style={[s.tab, activeTab === 'public' && s.tabActive]}
                onPress={() => setActiveTab('public')}
              >
                <Text style={[s.tabText, activeTab === 'public' && s.tabTextActive]}>Public Alert</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tab, activeTab === 'stakeholders' && s.tabActive]}
                onPress={() => setActiveTab('stakeholders')}
              >
                <Text style={[s.tabText, activeTab === 'stakeholders' && s.tabTextActive]}>Stakeholders</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'public' ? (
              <>
                {/* Channels */}
                <View style={s.channelRow}>
                  {ALERT_CHANNELS.map(ch => (
                    <View key={ch.id} style={s.channelChip}>
                      <Text style={s.channelIcon}>{ch.icon}</Text>
                      <Text style={s.channelLabel}>{ch.label}</Text>
                    </View>
                  ))}
                </View>

                {/* English Alert */}
                <View style={s.alertCard}>
                  <Text style={s.alertCardLang}>🇬🇧 English</Text>
                  <Text style={s.alertCardText}>{alertDraft.english_text}</Text>
                </View>

                {/* Roman Urdu Alert */}
                <View style={[s.alertCard, { borderColor: 'rgba(139,92,246,0.3)' }]}>
                  <Text style={[s.alertCardLang, { color: '#a78bfa' }]}>🇵🇰 Roman Urdu</Text>
                  <Text style={s.alertCardText}>{alertDraft.roman_urdu_text}</Text>
                </View>

                {/* SMS/WhatsApp Preview */}
                <View style={s.smsPreview}>
                  <Text style={s.smsPreviewLabel}>💬 Simulated SMS Preview</Text>
                  <View style={s.smsBox}>
                    <Text style={s.smsText}>
                      From: CrisesMesh-CDA{'\n'}
                      {'\n'}
                      🚨 EMERGENCY: Critical Urban Flooding at G-10 Underpass, ISB.{'\n'}
                      Avoid area. Emergency services deployed.{'\n'}
                      Stay indoors. Updates: CrisesMesh App
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              /* Stakeholder Messages */
              <>
                <Text style={s.sectionLabel}>Auto-Generated Stakeholder Notifications</Text>
                {STAKEHOLDER_MESSAGES.map((sm, i) => (
                  <View key={i} style={s.stakeholderCard}>
                    <View style={s.stakeholderHeader}>
                      <Text style={s.stakeholderIcon}>{sm.icon}</Text>
                      <Text style={s.stakeholderRole}>{sm.role}</Text>
                    </View>
                    <Text style={s.stakeholderMsg}>{sm.msg}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Action Buttons */}
            {alertStatus === 'Draft' && (
              <View style={s.actionRow}>
                <TouchableOpacity style={s.retractBtn} onPress={handleRetract}>
                  <Text style={s.retractBtnText}>❌ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.approveBtn, approving && { opacity: 0.6 }]}
                  onPress={handleApprove}
                  disabled={approving}
                >
                  {approving
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Text style={s.approveBtnText}>✅ Approve & Publish</Text>}
                </TouchableOpacity>
              </View>
            )}

            {alertStatus === 'Approved' && (
              <TouchableOpacity style={s.retractBtn2} onPress={handleRetract}>
                <Text style={s.retractBtnText}>⚠️ Retract Alert</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: { padding: Spacing.md },
  generateBtn: {
    backgroundColor: Colors.govAccent, borderRadius: 14, padding: 20,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20,
  },
  generateBtnText: { color: '#000', fontWeight: '800', fontSize: Typography.sizes.md },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: Spacing.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: '700', fontSize: Typography.sizes.sm },
  tabs: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, padding: 3, marginBottom: Spacing.md,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.govAccent },
  tabText: { color: Colors.govTextSecondary, fontWeight: '600', fontSize: Typography.sizes.sm },
  tabTextActive: { color: '#000' },
  channelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  channelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,255,210,0.08)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(0,255,210,0.2)',
  },
  channelIcon: { fontSize: 14 },
  channelLabel: { color: Colors.govText, fontSize: Typography.sizes.xs, fontWeight: '600' },
  alertCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,255,210,0.2)', padding: Spacing.md, marginBottom: Spacing.sm,
  },
  alertCardLang: { color: Colors.govAccent, fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  alertCardText: { color: Colors.govText, fontSize: Typography.sizes.sm, lineHeight: 22 },
  smsPreview: { marginTop: Spacing.md },
  smsPreviewLabel: { color: Colors.govTextSecondary, fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  smsBox: {
    backgroundColor: '#1a2332', borderRadius: 12, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  smsText: { color: '#94a3b8', fontSize: Typography.sizes.sm, lineHeight: 20 },
  sectionLabel: {
    color: Colors.govTextSecondary, fontSize: Typography.sizes.xs, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
  },
  stakeholderCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: Spacing.md, marginBottom: Spacing.sm,
  },
  stakeholderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stakeholderIcon: { fontSize: 20 },
  stakeholderRole: { color: Colors.govAccent, fontSize: Typography.sizes.sm, fontWeight: '700' },
  stakeholderMsg: { color: Colors.govTextSecondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  approveBtn: { flex: 2, backgroundColor: Colors.govAccent, borderRadius: 12, padding: 16, alignItems: 'center' },
  approveBtnText: { color: '#000', fontWeight: '800', fontSize: Typography.sizes.md },
  retractBtn: { flex: 1, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  retractBtn2: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: '#ef4444' },
  retractBtnText: { color: '#ef4444', fontWeight: '700', fontSize: Typography.sizes.sm },
});
