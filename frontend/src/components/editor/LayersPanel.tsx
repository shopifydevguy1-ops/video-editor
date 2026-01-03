'use client';

import { useEditorStore } from '@/lib/stores/editor-store';
import { Layer, LayerType } from '@ai-video-editor/shared';
import { Plus, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';

export function LayersPanel() {
  const {
    editorState,
    selectedLayerIds,
    setSelectedLayers,
    addLayer,
    removeLayer,
    updateLayer,
    reorderLayers,
  } = useEditorStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!editorState) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No project loaded</div>
      </div>
    );
  }

  const handleAddLayer = (type: LayerType) => {
    const baseLayer = {
      type,
      name: `${type} Layer ${editorState.layers.length + 1}`,
      startTime: editorState.duration || 0,
      duration: type === 'audio' ? 5 : 3,
      visible: true,
      locked: false,
      opacity: 1,
      zIndex: editorState.layers.length,
    };

    if (type === 'text') {
      addLayer({
        ...baseLayer,
        type: 'text',
        content: 'New Text',
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 100, y: 100 },
        alignment: 'center',
        animation: 'none',
      } as any);
    } else if (type === 'video') {
      addLayer({
        ...baseLayer,
        type: 'video',
        mediaId: '',
        src: '',
        trimStart: 0,
        trimEnd: 0,
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
      } as any);
    } else if (type === 'image') {
      addLayer({
        ...baseLayer,
        type: 'image',
        mediaId: '',
        src: '',
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
      } as any);
    } else if (type === 'audio') {
      addLayer({
        ...baseLayer,
        type: 'audio',
        mediaId: '',
        src: '',
        trimStart: 0,
        trimEnd: 0,
        volume: 1,
      } as any);
    }

    setShowAddMenu(false);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (confirm('Are you sure you want to delete this layer?')) {
      removeLayer(layerId);
    }
  };

  const sortedLayers = [...editorState.layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4">
        <h3 className="font-semibold text-sm">Layers</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1.5 hover:bg-gray-700 rounded transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          {showAddMenu && (
            <div className="absolute top-full right-0 mt-1 bg-gray-700 rounded shadow-lg z-10 min-w-[150px]">
              <button
                onClick={() => handleAddLayer('video')}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm"
              >
                Video
              </button>
              <button
                onClick={() => handleAddLayer('image')}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm"
              >
                Image
              </button>
              <button
                onClick={() => handleAddLayer('text')}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm"
              >
                Text
              </button>
              <button
                onClick={() => handleAddLayer('audio')}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-sm"
              >
                Audio
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No layers yet. Click + to add one.
          </div>
        ) : (
          <div className="p-2">
            {sortedLayers.map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                onSelect={() => setSelectedLayers([layer.id])}
                onDelete={() => handleDeleteLayer(layer.id)}
                onToggleVisible={() =>
                  updateLayer(layer.id, { visible: !layer.visible })
                }
                onToggleLocked={() =>
                  updateLayer(layer.id, { locked: !layer.locked })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
  onToggleLocked: () => void;
}

function LayerItem({
  layer,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisible,
  onToggleLocked,
}: LayerItemProps) {
  const getLayerIcon = (type: LayerType): string => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'text':
        return '📝';
      case 'audio':
        return '🔊';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={`p-2 mb-1 rounded cursor-pointer transition ${
        isSelected ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm">{getLayerIcon(layer.type)}</span>
          <span className="text-sm truncate">{layer.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisible();
            }}
            className="p-1 hover:bg-gray-500 rounded"
          >
            {layer.visible ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3 opacity-50" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLocked();
            }}
            className="p-1 hover:bg-gray-500 rounded"
          >
            {layer.locked ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-600 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

