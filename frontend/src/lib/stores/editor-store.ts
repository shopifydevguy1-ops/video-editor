import { create } from 'zustand';
import { EditorState, Layer, LayerType } from '@ai-video-editor/shared';

function nanoid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface EditorStore {
  editorState: EditorState | null;
  currentTime: number;
  isPlaying: boolean;
  selectedLayerIds: string[];
  zoom: number; // Timeline zoom level

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
}

const defaultEditorState: EditorState = {
  version: '1.0.0',
  aspectRatio: '16:9',
  resolution: { width: 1920, height: 1080 },
  duration: 0,
  fps: 30,
  layers: [],
  transitions: [],
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  editorState: defaultEditorState,
  currentTime: 0,
  isPlaying: false,
  selectedLayerIds: [],
  zoom: 1,

  setEditorState: (state) => set({ editorState: state }),

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
  },

  updateLayer: (layerId, updates) => {
    const { editorState } = get();
    if (!editorState) return;

    set({
      editorState: {
        ...editorState,
        layers: editorState.layers.map((layer) =>
          layer.id === layerId ? { ...layer, ...updates } : layer,
        ),
      },
    });
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
}));

