'use client';

import { useEditorStore } from '@/lib/stores/editor-store';
import { apiClient } from '@/lib/api/client';
import { ExportModal } from './ExportModal';
import { useState } from 'react';

interface ToolbarProps {
  projectId: string;
}

export function Toolbar({ projectId }: ToolbarProps) {
  const { editorState, pause, undo, redo, canUndo, canRedo } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleExport = async (settings: any) => {
    if (!editorState) return;

    setExporting(true);
    pause();
    try {
      const response = await apiClient.instance.post('/render/start', {
        projectId,
        settings,
      });
      // Handle render job creation
      console.log('Render started:', response.data);
      alert('Render started! Check render status in the projects page.');
    } catch (error) {
      console.error('Failed to start render:', error);
      alert('Failed to start render. Please try again.');
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
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Cmd+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Cmd+Shift+Z)"
        >
          ↷ Redo
        </button>
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
          onClick={() => setShowExportModal(true)}
          disabled={exporting || !editorState}
          className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export Video'}
        </button>
      </div>

      {showExportModal && editorState && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          defaultAspectRatio={editorState.aspectRatio}
          defaultResolution={editorState.resolution}
        />
      )}
    </div>
  );
}

