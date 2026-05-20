import { Platform } from 'react-native';

export const Colors = {
  // Primary brand
  primary: '#10B981',        // Emerald Green — trust, safety (Citizen Theme)
  primaryDark: '#059669',
  primaryLight: '#34D399',

  // Accent / emergency
  accent: '#F97316',         // Orange — urgency
  danger: '#EF4444',         // Red — alerts, Red Zone
  dangerDark: '#DC2626',
  success: '#22C55E',        // Green — verified, safe
  warning: '#EAB308',        // Yellow — caution

  // Citizen palette (light)
  citizenBg: '#F8FAFC',
  citizenCard: '#FFFFFF',
  citizenText: '#0F172A',
  citizenTextSecondary: '#64748B',
  citizenBorder: '#E2E8F0',

  // Government palette (dark command center)
  govBg: '#050814',
  govCard: '#0C1222',
  govCardAlt: '#121829',
  govText: '#F1F5F9',
  govTextSecondary: '#94A3B8',
  govBorder: '#1E293B',
  govAccent: '#0EA5E9',

  // Status colors
  statusSubmitted: '#0EA5E9',
  statusUnderReview: '#F59E0B',
  statusVerified: '#22C55E',
  statusRejected: '#EF4444',
  statusResolved: '#8B5CF6',

  // Severity colors
  severityLow: '#22C55E',
  severityMedium: '#F59E0B',
  severityHigh: '#F97316',
  severityCritical: '#EF4444',

  // Resource status
  resourceAvailable: '#22C55E',
  resourceAssigned: '#0EA5E9',
  resourceEnRoute: '#F59E0B',
  resourceUnavailable: '#EF4444',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const Typography = {
  fontFamily: {
    // English custom font stacks
    regular: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'sans-serif-bold',
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'System',
    }),
    // Urdu custom font stacks
    urRegular: Platform.select({
      ios: 'Geeza Pro',
      android: 'sans-serif',
      web: '"Noto Sans Arabic", "Noto Naskh Arabic", sans-serif',
      default: 'System',
    }),
    urMedium: Platform.select({
      ios: 'Geeza Pro',
      android: 'sans-serif-medium',
      web: '"Noto Sans Arabic", "Noto Naskh Arabic", sans-serif',
      default: 'System',
    }),
    urBold: Platform.select({
      ios: 'Geeza Pro',
      android: 'sans-serif-bold',
      web: '"Noto Sans Arabic", "Noto Naskh Arabic", sans-serif',
      default: 'System',
    }),
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    hero: 36,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const CrisisTypes = [
  { id: 'urban-flooding', label: 'Urban Flooding', icon: '🌊', active: true },
  { id: 'traffic-blockage', label: 'Traffic Blockage', icon: '🚗', active: false },
  { id: 'heat-emergency', label: 'Heat Emergency', icon: '🌡️', active: false },
  { id: 'power-outage', label: 'Power Outage', icon: '⚡', active: false },
  { id: 'disease-cluster', label: 'Disease Cluster', icon: '🦠', active: false },
  { id: 'public-disorder', label: 'Public Disorder', icon: '⚠️', active: false },
  { id: 'infrastructure-failure', label: 'Infrastructure Failure', icon: '🏗️', active: false },
];
