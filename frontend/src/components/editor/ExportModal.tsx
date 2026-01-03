'use client';

import { useState } from 'react';
import { X, Download, Video } from 'lucide-react';
import { RenderSettings, AspectRatio } from '@ai-video-editor/shared';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: RenderSettings) => void;
  defaultAspectRatio: AspectRatio;
  defaultResolution: { width: number; height: number };
}

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  defaultAspectRatio,
  defaultResolution,
}: ExportModalProps) {
  const [settings, setSettings] = useState<Partial<RenderSettings>>({
    resolution: defaultResolution,
    fps: 30,
    codec: 'h264',
    preset: 'medium',
    quality: 23,
    bitrate: '5M',
    includeCaptions: true,
  });

  const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'custom'>('youtube');

  if (!isOpen) return null;

  const handlePlatformChange = (p: 'youtube' | 'tiktok' | 'custom') => {
    setPlatform(p);
    if (p === 'youtube') {
      setSettings({
        ...settings,
        resolution: { width: 1920, height: 1080 },
        bitrate: '8M',
        quality: 23,
      });
    } else if (p === 'tiktok') {
      setSettings({
        ...settings,
        resolution: { width: 1080, height: 1920 },
        bitrate: '5M',
        quality: 23,
      });
    }
  };

  const handleExport = () => {
    onExport(settings as RenderSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            Export Video
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Platform Preset
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePlatformChange('youtube')}
                className={`p-4 rounded border-2 transition ${
                  platform === 'youtube'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">YouTube</div>
                <div className="text-xs text-gray-400 mt-1">1920x1080</div>
              </button>
              <button
                onClick={() => handlePlatformChange('tiktok')}
                className={`p-4 rounded border-2 transition ${
                  platform === 'tiktok'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">TikTok/Shorts</div>
                <div className="text-xs text-gray-400 mt-1">1080x1920</div>
              </button>
              <button
                onClick={() => handlePlatformChange('custom')}
                className={`p-4 rounded border-2 transition ${
                  platform === 'custom'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Custom</div>
                <div className="text-xs text-gray-400 mt-1">Manual</div>
              </button>
            </div>
          </div>

          {/* Resolution */}
          {platform === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={settings.resolution?.width || 1920}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resolution: {
                        ...settings.resolution!,
                        width: parseInt(e.target.value) || 1920,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={settings.resolution?.height || 1080}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resolution: {
                        ...settings.resolution!,
                        height: parseInt(e.target.value) || 1080,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>
          )}

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Quality (CRF: {settings.quality})
            </label>
            <input
              type="range"
              min="18"
              max="28"
              value={settings.quality || 23}
              onChange={(e) =>
                setSettings({ ...settings, quality: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>High Quality</span>
              <span>Balanced</span>
              <span>Smaller File</span>
            </div>
          </div>

          {/* Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Encoding Preset
            </label>
            <select
              value={settings.preset || 'medium'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  preset: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="ultrafast">Ultrafast (Fastest)</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium (Recommended)</option>
              <option value="slow">Slow (Best Quality)</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.includeCaptions || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    includeCaptions: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Include captions/subtitles</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Video
          </button>
        </div>
      </div>
    </div>
  );
}

