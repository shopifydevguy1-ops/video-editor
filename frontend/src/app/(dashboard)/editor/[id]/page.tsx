'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEditorStore } from '@/lib/stores/editor-store';
import { Timeline } from '@/components/editor/Timeline';
import { VideoPreview } from '@/components/editor/VideoPreview';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { apiClient } from '@/lib/api/client';
import { Project, EditorState } from '@ai-video-editor/shared';

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setEditorState } = useEditorStore();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await apiClient.instance.get<Project>(`/projects/${projectId}`);
        setEditorState(response.data.editorState);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project');
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId, setEditorState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        <Toolbar projectId={projectId} />
        <div className="flex flex-1 overflow-hidden">
          <LayersPanel />
          <div className="flex-1 flex flex-col">
            <VideoPreview />
            <Timeline />
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </ProtectedRoute>
  );
}

