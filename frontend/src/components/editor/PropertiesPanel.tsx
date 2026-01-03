'use client';

import { useEditorStore } from '@/lib/stores/editor-store';
import { Layer } from '@ai-video-editor/shared';

export function PropertiesPanel() {
  const { editorState, selectedLayerIds, updateLayer } = useEditorStore();

  if (!editorState) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No project loaded</div>
      </div>
    );
  }

  const selectedLayer =
    selectedLayerIds.length === 1
      ? editorState.layers.find((l) => l.id === selectedLayerIds[0])
      : null;

  if (!selectedLayer) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Select a layer to edit properties</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="h-12 border-b border-gray-700 flex items-center px-4">
        <h3 className="font-semibold text-sm">Properties</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Name
          </label>
          <input
            type="text"
            value={selectedLayer.name}
            onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Start Time (s)
          </label>
          <input
            type="number"
            value={selectedLayer.startTime.toFixed(2)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                startTime: parseFloat(e.target.value) || 0,
              })
            }
            step="0.1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Duration (s)
          </label>
          <input
            type="number"
            value={selectedLayer.duration.toFixed(2)}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                duration: parseFloat(e.target.value) || 0,
              })
            }
            step="0.1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedLayer.opacity}
            onChange={(e) =>
              updateLayer(selectedLayer.id, {
                opacity: parseFloat(e.target.value),
              })
            }
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(selectedLayer.opacity * 100)}%
          </div>
        </div>

        {selectedLayer.type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Content
              </label>
              <textarea
                value={selectedLayer.content}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { content: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={selectedLayer.fontSize}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    fontSize: parseInt(e.target.value) || 48,
                  })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Color
              </label>
              <input
                type="color"
                value={selectedLayer.color}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, { color: e.target.value })
                }
                className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {(selectedLayer.type === 'video' || selectedLayer.type === 'image') && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Scale
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedLayer.scale}
                onChange={(e) =>
                  updateLayer(selectedLayer.id, {
                    scale: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(selectedLayer.scale * 100)}%
              </div>
            </div>
          </>
        )}

        {selectedLayer.type === 'audio' && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedLayer.volume}
              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  volume: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(selectedLayer.volume * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

