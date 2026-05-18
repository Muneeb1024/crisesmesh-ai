/**
 * CrisesMesh AI — TypeScript Type Definitions
 */

export type UserRole = 'citizen' | 'government';

export type ReportCategory =
  | 'Urban Flooding'
  | 'Water Logging'
  | 'Drain Overflow'
  | 'Fire Incident'
  | 'Earthquake Damage'
  | 'Road Blockage'
  | 'Infrastructure Damage'
  | 'Medical Emergency'
  | 'Landslide'
  | 'Gas Leak'
  | 'Power Outage'
  | 'Other Emergency';

export type ReportStatus = 'Submitted' | 'Under Review' | 'Verified' | 'Rejected' | 'Resolved';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ResourceStatus = 'Available' | 'Assigned' | 'En Route' | 'Unavailable';

export type IncidentStatus = 'Active' | 'Resolved' | 'Reclassified' | 'Retracted';

export interface CitizenProfile {
  name: string;
  phone: string;
}

export interface CitizenReport {
  id: string;
  citizen_name: string;
  phone: string;
  category: ReportCategory;
  description: string;
  transcribed_voice_text?: string;
  photo_url?: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  created_at: string;
}

export interface Signal {
  id: string;
  source: string;
  incident_candidate_id: string;
  text: string;
  lat: number;
  lng: number;
  credibility_score: number;
  geo_confidence: number;
  urgency_score: number;
  timestamp: string;
}

export interface Incident {
  id: string;
  type: string;
  status: IncidentStatus;
  severity: SeverityLevel;
  confidence: number;
  priority_score: number;
  lat: number;
  lng: number;
  affected_radius_m: number;
  estimated_population: number;
  expected_duration_hours: number;
  peak_impact_time: string;
  red_zone_geojson?: object;
  created_at: string;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  status: ResourceStatus;
  lat: number;
  lng: number;
  capacity: number;
  eta_minutes: number;
}

export interface AgentTrace {
  id: string;
  incident_id: string;
  agent_name: string;
  input_summary: string;
  reasoning_summary: string;
  output: object;
  confidence: number;
  created_at: string;
}

export interface Alert {
  id: string;
  incident_id: string;
  status: 'Draft' | 'Approved' | 'Retracted';
  severity: SeverityLevel;
  english_text: string;
  roman_urdu_text: string;
  channels: string[];
  approved_by?: string;
}

// Navigation types
export type RootStackParamList = {
  Landing: undefined;
  CitizenOnboarding: undefined;
  CitizenHome: undefined;
  CitizenReport: undefined;
  CitizenReportStatus: { reportId: string };
  CitizenAlerts: undefined;
  CitizenAlertLive: undefined;
  CitizenMap: undefined;
  GovernmentPin: undefined;
  GovernmentHome: undefined;
  GovernmentIncident: { incidentId: string };
  AgentTracePanel: { incidentId?: string };
  ResourceAllocation: { incidentId?: string };
  RedZoneMap: { incidentId?: string };
  AlertApproval: { incidentId?: string };
  Recovery: { incidentId?: string };
};
