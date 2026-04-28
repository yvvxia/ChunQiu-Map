import { create } from 'zustand'
import type { AppState, MapMode } from '@/domain/types'

interface AppStore extends AppState {
  setLuYear: (id: string) => void
  setMapMode: (mode: MapMode) => void
  selectEntity: (id: string | null, type: AppState['selectedEntityType']) => void
  setPanelTab: (tab: AppState['panelTab']) => void
  setSearchQuery: (q: string) => void
  toggleRightPanel: () => void
  setMobilePanelOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>(set => ({
  currentLuYearId: 'yin-1',
  mapMode: 'chunqiu',
  selectedEntityId: null,
  selectedEntityType: null,
  panelTab: 'state',
  searchQuery: '',
  rightPanelCollapsed: false,
  mobilePanelOpen: false,

  setLuYear: (id) => set({ currentLuYearId: id }),
  setMapMode: (mode) => set({ mapMode: mode }),
  selectEntity: (id, type) =>
    set(state => ({
      selectedEntityId: id,
      selectedEntityType: type,
      panelTab:
        id && (type === 'person' || type === 'state' || type === 'place')
          ? (type as 'person' | 'state' | 'place')
          : state.panelTab,
    })),
  setPanelTab: (tab) => set({ panelTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleRightPanel: () => set(s => ({ rightPanelCollapsed: !s.rightPanelCollapsed })),
  setMobilePanelOpen: (open) => set({ mobilePanelOpen: open }),
}))
