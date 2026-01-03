'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/stores/editor-store';
import { Layer } from '@ai-video-editor/shared';
import { formatDuration } from '@/lib/utils';

const PIXELS_PER_SECOND = 50; // Base timeline scale

export function Timeline() {
  const {
    editorState,
    currentTime,
    zoom,
    selectedLayerIds,
    setCurrentTime,
    setSelectedLayers,
    updateLayer,
  } = useEditorStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; time: number } | null>(null);

  const pixelsPerSecond = editorState ? PIXELS_PER_SECOND * zoom : PIXELS_PER_SECOND;
  const timelineWidth = editorState ? editorState.duration * pixelsPerSecond : 0;

  useEffect(() => {
    if (isDragging && dragStart && editorState) {
      const handleMouseMove = (e: MouseEvent) => {
        if (timelineRef.current) {
          const rect = timelineRef.current.getBoundingClientRect();
          const deltaX = e.clientX - dragStart.x;
          const deltaTime = deltaX / pixelsPerSecond;
          const newStartTime = Math.max(0, dragStart.time + deltaTime);

          selectedLayerIds.forEach((layerId) => {
            const layer = editorState.layers.find((l) => l.id === layerId);
            if (layer) {
              updateLayer(layerId, { startTime: newStartTime });
            }
          });
        }
      };

      const handleMouseUp = () => {
        handleLayerDragEnd();
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, selectedLayerIds, editorState, pixelsPerSecond, updateLayer]);

  if (!editorState) {
    return (
      <div className="h-64 bg-gray-800 border-t border-gray-700 flex items-center justify-center">
        <div className="text-gray-500">No timeline data</div>
      </div>
    );
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(time, editorState.duration)));
  };

  const handleLayerDragStart = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const layer = editorState.layers.find((l) => l.id === layerId);
    if (layer) {
      setDragStart({ x: e.clientX, time: layer.startTime });
      if (!selectedLayerIds.includes(layerId)) {
        setSelectedLayers([layerId]);
      }
    }
  };

  const handleLayerDrag = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaTime = deltaX / pixelsPerSecond;
    const newStartTime = Math.max(0, dragStart.time + deltaTime);

    selectedLayerIds.forEach((layerId) => {
      const layer = editorState.layers.find((l) => l.id === layerId);
      if (layer) {
        updateLayer(layerId, { startTime: newStartTime });
      }
    });
  };

  const handleLayerDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };


  const getLayerColor = (layer: Layer): string => {
    switch (layer.type) {
      case 'video':
        return 'bg-blue-500';
      case 'image':
        return 'bg-green-500';
      case 'text':
        return 'bg-purple-500';
      case 'audio':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate time markers
  const markers = [];
  const interval = zoom < 1 ? 10 : zoom < 2 ? 5 : 1; // seconds between markers
  for (let i = 0; i <= editorState.duration; i += interval) {
    markers.push(i);
  }

  return (
    <div className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
      {/* Time ruler */}
      <div className="h-8 bg-gray-900 border-b border-gray-700 flex items-center relative overflow-x-auto">
        <div
          className="absolute top-0 left-0 h-full flex"
          style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
        >
          {markers.map((time) => (
            <div
              key={time}
              className="absolute top-0 h-full border-l border-gray-600"
              style={{ left: `${time * pixelsPerSecond}px` }}
            >
              <span className="absolute top-0 left-1 text-xs text-gray-400">
                {formatDuration(time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline tracks */}
      <div
        ref={timelineRef}
        className="flex-1 relative overflow-x-auto cursor-pointer"
        onClick={handleTimelineClick}
        onMouseMove={handleLayerDrag}
        onMouseUp={handleLayerDragEnd}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary-500 z-50 pointer-events-none"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary-500" />
          </div>

          {/* Layers */}
          {editorState.layers.map((layer) => (
            <div
              key={layer.id}
              className={`absolute top-2 h-12 rounded cursor-move transition ${
                getLayerColor(layer)
              } ${
                selectedLayerIds.includes(layer.id)
                  ? 'ring-2 ring-primary-400 opacity-100'
                  : 'opacity-80'
              }`}
              style={{
                left: `${layer.startTime * pixelsPerSecond}px`,
                width: `${layer.duration * pixelsPerSecond}px`,
              }}
              onMouseDown={(e) => handleLayerDragStart(layer.id, e)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLayers([layer.id]);
              }}
            >
              <div className="h-full px-2 flex items-center text-white text-xs font-medium truncate">
                {layer.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

