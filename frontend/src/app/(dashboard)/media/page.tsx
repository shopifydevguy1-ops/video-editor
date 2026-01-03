'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MediaUpload } from '@/components/media/MediaUpload';
import { apiClient } from '@/lib/api/client';
import { MediaItem, MediaType } from '@ai-video-editor/shared';
import { Upload, Search, Grid, List, Trash2, Video, Image as ImageIcon, Music } from 'lucide-react';
import { formatFileSize, formatDuration } from '@/lib/utils';

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const loadMedia = async () => {
    try {
      const type = filterType === 'all' ? undefined : filterType;
      const response = await apiClient.instance.get<MediaItem[]>('/media', {
        params: { type },
      });
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await apiClient.instance.delete(`/media/${id}`);
      setMedia(media.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const handleUploadComplete = (newMedia: MediaItem) => {
    setMedia([newMedia, ...media]);
    setShowUpload(false);
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Media Library</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-700 rounded transition"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
              >
                <Upload className="w-5 h-5" />
                Upload Media
              </button>
            </div>
          </div>

          {showUpload && (
            <div className="mb-8">
              <MediaUpload onUploadComplete={handleUploadComplete} />
            </div>
          )}

          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MediaType | 'all')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading media...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No media found</p>
              {!showUpload && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
                >
                  Upload Your First Media
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition group"
                >
                  {item.thumbnailUrl ? (
                    <div className="w-full h-40 relative">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatFileSize(item.metadata.size || 0)}</span>
                      {item.metadata.duration && (
                        <span>{formatDuration(item.metadata.duration)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="mt-2 w-full py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition group"
                >
                  {item.thumbnailUrl ? (
                    <div className="w-20 h-20 relative rounded overflow-hidden">
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>{item.type}</span>
                      <span>{formatFileSize(item.metadata.size || 0)}</span>
                      {item.metadata.duration && (
                        <span>{formatDuration(item.metadata.duration)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

