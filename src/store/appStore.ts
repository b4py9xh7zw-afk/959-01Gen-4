import { create } from 'zustand';
import type { SystemSettings, Factory, Gateway } from '../../shared/types.js';
import { settingsApi, factoryApi, gatewayApi } from '../api/index.js';

interface AppState {
  settings: SystemSettings | null;
  factories: Factory[];
  gateways: Gateway[];
  sidebarCollapsed: boolean;
  loading: Record<string, boolean>;
  error: string | null;

  loadSettings: () => Promise<void>;
  loadFactories: () => Promise<void>;
  loadGateways: () => Promise<void>;
  toggleSidebar: () => void;
  setLoading: (key: string, value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  factories: [],
  gateways: [],
  sidebarCollapsed: false,
  loading: {},
  error: null,

  loadSettings: async () => {
    try {
      set({ loading: { settings: true } });
      const settings = await settingsApi.get();
      set({ settings });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: { settings: false } });
    }
  },

  loadFactories: async () => {
    try {
      set({ loading: { factories: true } });
      const factories = await factoryApi.list();
      set({ factories });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: { factories: false } });
    }
  },

  loadGateways: async () => {
    try {
      set({ loading: { gateways: true } });
      const gateways = await gatewayApi.listAll();
      set({ gateways });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: { gateways: false } });
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setLoading: (key, value) => set((state) => ({ loading: { ...state.loading, [key]: value } })),
  setError: (error) => set({ error }),
}));
