/**
 * CrisesMesh AI — API Service
 * Connects mobile app to FastAPI backend.
 */

import { Platform, NativeModules } from 'react-native';

// Backend URL — change for production
const API_BASE = 'https://muneeb785-crisesmesh-ai.hf.space'; // Production Hugging Face Space URL

const getLocalIp = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const matches = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?/);
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  return '192.168.100.15'; // Fallback to original local IP
};

const LOCAL_IP = getLocalIp();
const API_BASE_LOCAL = `http://${LOCAL_IP}:8000`; // Local development URL for mobile

const getApiBaseWeb = () => {
  if (typeof window === 'undefined' || !window.location) {
    return 'http://localhost:8000';
  }
  const origin = window.location.origin;
  // If we are running on Expo web development ports (8081 or 19006), rewrite the API base to port 8000 on the same host
  if (origin.includes(':8081') || origin.includes(':19006')) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return origin;
};

const API_BASE_WEB = getApiBaseWeb();
const API_V1 = '/api/v1';

// Detect platform — use web URL for Expo web
export const BASE_URL = Platform.OS === 'web' 
  ? API_BASE_WEB 
  : (__DEV__ ? API_BASE_LOCAL : API_BASE);
export const API_BASE_URL = `${BASE_URL}${API_V1}`;

// ──────────── Types ────────────

export interface ReportPayload {
  citizen_name: string;
  phone: string;
  category: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical' | null;
  description: string;
  transcribed_voice_text?: string | null;
  photo_url?: string | null;
  lat: number;
  lng: number;
  road_blocked: boolean;
}

export interface ReportResponse {
  id: string;
  citizen_name: string;
  phone: string;
  category: string;
  severity: string | null;
  description: string;
  lat: number;
  lng: number;
  road_blocked: boolean;
  status: string;
  created_at: string;
}

export interface IncidentResponse {
  id: string;
  type: string;
  status: string;
  severity: string;
  confidence: number;
  priority_score: number;
  lat: number;
  lng: number;
  affected_radius_m: number;
  estimated_population: number;
  expected_duration_hours: number;
  peak_impact_time: string | null;
  report_ids: string[];
  signal_ids: string[];
  created_at: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  timestamp: string;
}

// ──────────── Fetch Helper ────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.detail || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return { data: data as T, error: null, status: response.status };
  } catch (err: any) {
    console.error('[API Error]', path, err.message);
    return {
      data: null,
      error: err.message || 'Network error — is the backend running?',
      status: 0,
    };
  }
}

// ──────────── Health ────────────

export async function checkHealth(): Promise<HealthResponse | null> {
  const { data } = await apiFetch<HealthResponse>('/health');
  return data;
}

// ──────────── Citizen ────────────

export async function submitReport(payload: ReportPayload): Promise<{
  data: ReportResponse | null;
  error: string | null;
}> {
  const result = await apiFetch<ReportResponse>(`${API_V1}/citizen/reports`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { data: result.data, error: result.error };
}

export async function getReport(reportId: string): Promise<ReportResponse | null> {
  const { data } = await apiFetch<ReportResponse>(`${API_V1}/citizen/reports/${reportId}`);
  return data;
}

export async function listReports(): Promise<ReportResponse[]> {
  const { data } = await apiFetch<ReportResponse[]>(`${API_V1}/citizen/reports`);
  return data || [];
}

// ──────────── Government ────────────

export async function listIncidents(): Promise<IncidentResponse[]> {
  const { data } = await apiFetch<IncidentResponse[]>(`${API_V1}/government/incidents`);
  return data || [];
}

export async function getIncident(incidentId: string): Promise<IncidentResponse | null> {
  const { data } = await apiFetch<IncidentResponse>(`${API_V1}/government/incidents/${incidentId}`);
  return data;
}

export async function triggerEvacuation(incidentId: string): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiFetch<{ success: boolean; message: string }>(
    `${API_V1}/government/incidents/${incidentId}/evacuate`,
    { method: 'POST' }
  );
  return { success: !!data?.success, message: data?.message };
}

// ──────────── Shelters ────────────

export interface ShelterResponse {
  id: string;
  name: string;
  status: 'Available' | 'Closed';
  capacity: number;
  occupancy: number;
  lat: number;
  lng: number;
}

export async function fetchShelters(): Promise<ShelterResponse[]> {
  const { data } = await apiFetch<ShelterResponse[]>(`${API_V1}/resources/shelters`);
  return data || [];
}

export async function toggleShelter(shelterId: string): Promise<boolean> {
  const { data } = await apiFetch<{ success: boolean }>(`${API_V1}/resources/shelters/${shelterId}/toggle`, {
    method: 'POST',
  });
  return !!data?.success;
}

// ──────────── Citizen SOS ────────────

export async function triggerCitizenSos(
  lat: number,
  lng: number,
  name: string,
  phone: string
): Promise<{ success: boolean; message?: string; incident_id?: string }> {
  const { data } = await apiFetch<{ success: boolean; message: string; incident_id: string }>(
    `${API_V1}/citizen/sos`,
    {
      method: 'POST',
      body: JSON.stringify({ lat, lng, citizen_name: name, phone }),
    }
  );
  return { success: !!data?.success, message: data?.message, incident_id: data?.incident_id };
}


// ──────────── Demo ────────────

export async function resetDemo(): Promise<boolean> {
  const { error } = await apiFetch(`${API_V1}/demo/reset`, { method: 'POST' });
  return !error;
}

export async function startFloodScenario(): Promise<any> {
  const { data } = await apiFetch(`${API_V1}/demo/start-flood-scenario`, { method: 'POST' });
  return data;
}

// ──────────── Agents ────────────

export interface AgentTrace {
  id: string;
  agent_name: string;
  incident_id: string;
  input_summary: string;
  reasoning_summary: string;
  output: Record<string, any>;
  confidence: number;
  execution_ms: number;
  created_at: string;
}

export interface TraceListResponse {
  incident_id: string;
  traces: AgentTrace[];
  count: number;
}

export async function runAgentPipeline(incidentId: string): Promise<any> {
  const { data, error } = await apiFetch(
    `${API_V1}/agents/run-pipeline?incident_id=${incidentId}`,
    { method: 'POST' }
  );
  return { data, error };
}

export async function getAgentTraces(incidentId: string): Promise<AgentTrace[]> {
  const { data } = await apiFetch<TraceListResponse>(
    `${API_V1}/agents/traces/${incidentId}`
  );
  return data?.traces || [];
}

export async function getAllTraces(): Promise<AgentTrace[]> {
  const { data } = await apiFetch<{ traces: AgentTrace[]; count: number }>(
    `${API_V1}/agents/traces`
  );
  return data?.traces || [];
}
