'use client';

import { useEditorStore } from '@/lib/stores/editor-store';
import { apiClient } from '@/lib/api/client';
import { useState } from 'react';

interface ToolbarProps {
  projectId: string;
}

export function Toolbar({ projectId }: ToolbarProps) {
  const { editorState, pause } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    if (!editorState) return;

    setSaving(true);
    try {
      await apiClient.instance.patch(`/projects/${projectId}`, {
        editorState,
      });
      // Show success toast
    } catch (error) {
      console.error('Failed to save:', error);
      // Show error toast
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!editorState) return;

    setExporting(true);
    pause();
    try {
      const response = await apiClient.instance.post('/render/start', {
        projectId,
      });
      // Handle render job creation
      console.log('Render started:', response.data);
    } catch (error) {
      console.error('Failed to start render:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded transition"
        >
          ← Back
        </button>
        <div className="h-6 w-px bg-gray-600" />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 rounded transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleExport}
          disabled={exporting || !editorState}
          className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export Video'}
        </button>
      </div>
    </div>
  );
}

