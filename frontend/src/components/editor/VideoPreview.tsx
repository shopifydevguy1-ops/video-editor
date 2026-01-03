'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/stores/editor-store';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export function VideoPreview() {
  const {
    editorState,
    currentTime,
    isPlaying,
    setCurrentTime,
    play,
    pause,
    togglePlay,
  } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!editorState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on aspect ratio
    const container = canvas.parentElement;
    if (container) {
      const { width, height } = editorState.resolution;
      const aspectRatio = width / height;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      let canvasWidth = containerWidth;
      let canvasHeight = containerWidth / aspectRatio;
      
      if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    const render = () => {
      if (!ctx || !editorState) return;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render layers at current time
      const visibleLayers = editorState.layers
        .filter((layer) => {
          const start = layer.startTime;
          const end = layer.startTime + layer.duration;
          return currentTime >= start && currentTime <= end && layer.visible;
        })
        .sort((a, b) => a.zIndex - b.zIndex);

      visibleLayers.forEach((layer) => {
        renderLayer(ctx, layer, currentTime, canvas.width, canvas.height);
      });
    };

    render();
  }, [editorState, currentTime]);

  const renderLayer = (
    ctx: CanvasRenderingContext2D,
    layer: any,
    time: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const relativeTime = time - layer.startTime;
    const opacity = layer.opacity || 1;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (layer.type === 'text') {
      ctx.fillStyle = layer.color || '#fff';
      ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily || 'Arial'}`;
      ctx.textAlign = layer.alignment || 'left';
      ctx.textBaseline = 'top';
      
      const x = (layer.position?.x || 0) * (canvasWidth / (editorState?.resolution.width || 1920));
      const y = (layer.position?.y || 0) * (canvasHeight / (editorState?.resolution.height || 1080));
      
      ctx.fillText(layer.content || '', x, y);
    } else if (layer.type === 'image' && layer.src) {
      // Image rendering would require loading the image
      // For now, just draw a placeholder
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Image Layer', canvasWidth / 2, canvasHeight / 2);
    }

    ctx.restore();
  };

  useEffect(() => {
    if (isPlaying && editorState) {
      const startTime = Date.now();
      const startPosition = currentTime;

      const update = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = startPosition + elapsed;

        if (newTime >= editorState.duration) {
          setCurrentTime(editorState.duration);
          pause();
        } else {
          setCurrentTime(newTime);
          animationFrameRef.current = requestAnimationFrame(update);
        }
      };

      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, editorState, currentTime, setCurrentTime, pause]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorState) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const newTime = progress * editorState.duration;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!editorState) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-gray-500">No project loaded</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full bg-gray-900"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center px-4 gap-4">
        <button
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
          className="p-2 hover:bg-gray-700 rounded transition"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className="p-2 hover:bg-gray-700 rounded transition"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={() => setCurrentTime(Math.min(editorState.duration, currentTime + 5))}
          className="p-2 hover:bg-gray-700 rounded transition"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <div className="flex-1 mx-4">
          <div
            className="h-2 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{
                width: `${(currentTime / editorState.duration) * 100}%`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-pointer"
              style={{
                left: `${(currentTime / editorState.duration) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-400 min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(editorState.duration)}
        </div>
      </div>
    </div>
  );
}

