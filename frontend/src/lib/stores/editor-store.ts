import { create } from 'zustand';
import { EditorState, Layer, LayerType } from '@ai-video-editor/shared';

function nanoid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface HistoryState {
  editorState: EditorState;
  timestamp: number;
}

interface EditorStore {
  editorState: EditorState | null;
  currentTime: number;
  isPlaying: boolean;
  selectedLayerIds: string[];
  zoom: number;
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setEditorState: (state: EditorState) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedLayers: (layerIds: string[]) => void;
  setZoom: (zoom: number) => void;

  // Layer operations
  addLayer: (layer: Omit<Layer, 'id'>) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  reorderLayers: (layerIds: string[]) => void;

  // Timeline operations
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;

  // History operations
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorStore>((set, get) => ({
  editorState: null,
  currentTime: 0,
  isPlaying: false,
  selectedLayerIds: [],
  zoom: 1,
  history: [],
  historyIndex: -1,

  setEditorState: (state) => {
    set({ editorState: state });
    get().saveToHistory();
  },

  setCurrentTime: (time) => {
    const { editorState } = get();
    if (editorState) {
      const clampedTime = Math.max(0, Math.min(time, editorState.duration));
      set({ currentTime: clampedTime });
    }
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setSelectedLayers: (layerIds) => set({ selectedLayerIds: layerIds }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),

  addLayer: (layerData) => {
    const { editorState } = get();
    if (!editorState) return;

    const newLayer: Layer = {
      ...layerData,
      id: nanoid(),
      zIndex: editorState.layers.length,
    } as Layer;

    set({
      editorState: {
        ...editorState,
        layers: [...editorState.layers, newLayer],
      },
    });
    get().saveToHistory();
  },

  removeLayer: (layerId) => {
    const { editorState } = get();
    if (!editorState) return;

    set({
      editorState: {
        ...editorState,
        layers: editorState.layers.filter((l) => l.id !== layerId),
      },
      selectedLayerIds: get().selectedLayerIds.filter((id) => id !== layerId),
    });
    get().saveToHistory();
  },

  updateLayer: (layerId, updates) => {
    const { editorState } = get();
    if (!editorState) return;

      set({
        editorState: {
          ...editorState,
          layers: editorState.layers.map((layer) =>
            layer.id === layerId ? { ...layer, ...updates } as Layer : layer,
          ),
        },
      });
    // Debounce history saves for updates
    setTimeout(() => get().saveToHistory(), 500);
  },

  reorderLayers: (layerIds) => {
    const { editorState } = get();
    if (!editorState) return;

    const layerMap = new Map(editorState.layers.map((l) => [l.id, l]));
    const reorderedLayers = layerIds
      .map((id) => layerMap.get(id))
      .filter((l): l is Layer => l !== undefined)
      .map((layer, index) => ({ ...layer, zIndex: index }));

    set({
      editorState: {
        ...editorState,
        layers: reorderedLayers,
      },
    });
    get().saveToHistory();
  },

  seekTo: (time) => {
    get().setCurrentTime(time);
    get().setIsPlaying(false);
  },

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  saveToHistory: () => {
    const { editorState, history, historyIndex } = get();
    if (!editorState) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      editorState: JSON.parse(JSON.stringify(editorState)),
      timestamp: Date.now(),
    });

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        editorState: history[newIndex].editorState,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        editorState: history[newIndex].editorState,
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
}));
