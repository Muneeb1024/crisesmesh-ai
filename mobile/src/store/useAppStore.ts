/**
 * CrisesMesh AI — Global State Store (Zustand)
 */
import { create } from 'zustand';
import type { CitizenProfile, CitizenReport, Incident, Alert, AgentTrace, Resource } from '../constants/types';

interface AppState {
  // User
  role: 'citizen' | 'government' | null;
  citizenProfile: CitizenProfile | null;
  isGovernmentAuthenticated: boolean;

  // Citizen data
  citizenReports: CitizenReport[];
  citizenAlerts: Alert[];

  // Government data
  incidents: Incident[];
  resources: Resource[];
  agentTraces: AgentTrace[];

  // Actions
  setRole: (role: 'citizen' | 'government' | null) => void;
  setCitizenProfile: (profile: CitizenProfile) => void;
  setGovernmentAuthenticated: (val: boolean) => void;
  addCitizenReport: (report: CitizenReport) => void;
  updateReportStatus: (id: string, status: CitizenReport['status']) => void;
  setIncidents: (incidents: Incident[]) => void;
  setResources: (resources: Resource[]) => void;
  setAgentTraces: (traces: AgentTrace[]) => void;
  setCitizenAlerts: (alerts: Alert[]) => void;
  reset: () => void;
}

const initialState = {
  role: null as 'citizen' | 'government' | null,
  citizenProfile: null as CitizenProfile | null,
  isGovernmentAuthenticated: false,
  citizenReports: [] as CitizenReport[],
  citizenAlerts: [] as Alert[],
  incidents: [] as Incident[],
  resources: [] as Resource[],
  agentTraces: [] as AgentTrace[],
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setRole: (role) => set({ role }),

  setCitizenProfile: (profile) => set({ citizenProfile: profile }),

  setGovernmentAuthenticated: (val) => set({ isGovernmentAuthenticated: val }),

  addCitizenReport: (report) =>
    set((state) => ({
      citizenReports: [report, ...state.citizenReports],
    })),

  updateReportStatus: (id, status) =>
    set((state) => ({
      citizenReports: state.citizenReports.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  setIncidents: (incidents) => set({ incidents }),

  setResources: (resources) => set({ resources }),

  setAgentTraces: (traces) => set({ agentTraces: traces }),

  setCitizenAlerts: (alerts) => set({ citizenAlerts: alerts }),

  reset: () => set(initialState),
}));
