'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/stores/editor-store';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Layer } from '@ai-video-editor/shared';

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
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationFrameRef = useRef<number>();
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());

  const renderLayer = (
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    time: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const relativeTime = time - layer.startTime;
    const opacity = layer.opacity || 1;
    const scale = layer.scale || 1;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (layer.type === 'text') {
      ctx.fillStyle = layer.color || '#fff';
      ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily || 'Arial'}`;
      ctx.textAlign = layer.alignment || 'left';
      ctx.textBaseline = 'top';
      
      const x = (layer.position?.x || 0) * (canvasWidth / (editorState?.resolution.width || 1920));
      const y = (layer.position?.y || 0) * (canvasHeight / (editorState?.resolution.height || 1080));
      
      if (layer.type === 'text') {
        if (layer.backgroundColor) {
          const metrics = ctx.measureText(layer.content || '');
          ctx.fillStyle = layer.backgroundColor;
          ctx.fillRect(x - 5, y - 5, metrics.width + 10, layer.fontSize + 10);
        }
        
        ctx.fillStyle = layer.color || '#fff';
        ctx.fillText(layer.content || '', x, y);
      }
    } else if (layer.type === 'image' && layer.src) {
      const img = imageRefs.current.get(layer.id);
      if (img && img.complete) {
        const x = (layer.position?.x || 0) * (canvasWidth / (editorState?.resolution.width || 1920));
        const y = (layer.position?.y || 0) * (canvasHeight / (editorState?.resolution.height || 1080));
        const width = img.width * scale * (canvasWidth / (editorState?.resolution.width || 1920));
        const height = img.height * scale * (canvasHeight / (editorState?.resolution.height || 1080));
        
        ctx.drawImage(img, x, y, width, height);
      } else {
        // Placeholder while loading
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading image...', canvasWidth / 2, canvasHeight / 2);
      }
    } else if (layer.type === 'video' && layer.src) {
      const video = videoRefs.current.get(layer.id);
      if (video && video.readyState >= 2) {
        const x = (layer.position?.x || 0) * (canvasWidth / (editorState?.resolution.width || 1920));
        const y = (layer.position?.y || 0) * (canvasHeight / (editorState?.resolution.height || 1080));
        const width = video.videoWidth * scale * (canvasWidth / (editorState?.resolution.width || 1920));
        const height = video.videoHeight * scale * (canvasHeight / (editorState?.resolution.height || 1080));
        
        // Set video time
        const videoTime = relativeTime + (layer.trimStart || 0);
        if (Math.abs(video.currentTime - videoTime) > 0.1) {
          video.currentTime = videoTime;
        }
        
        ctx.drawImage(video, x, y, width, height);
      } else {
        // Placeholder while loading
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading video...', canvasWidth / 2, canvasHeight / 2);
      }
    }

    ctx.restore();
  };

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

    // Load video and image assets
    editorState.layers.forEach((layer) => {
      if ((layer.type === 'video' || layer.type === 'image') && layer.src) {
        loadAsset(layer.id, layer.src, layer.type);
      }
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, currentTime, loadedAssets]);

  const loadAsset = async (id: string, src: string, type: 'video' | 'image') => {
    if (loadedAssets.has(id)) return;

    return new Promise<void>((resolve, reject) => {
      if (type === 'video') {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.src = src;
        video.onloadeddata = () => {
          videoRefs.current.set(id, video);
          setLoadedAssets((prev) => new Set(prev).add(id));
          resolve();
        };
        video.onerror = reject;
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
          imageRefs.current.set(id, img);
          setLoadedAssets((prev) => new Set(prev).add(id));
          resolve();
        };
        img.onerror = reject;
      }
    });
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
