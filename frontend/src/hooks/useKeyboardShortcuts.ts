import { useEffect } from 'react';
import { useEditorStore } from '@/lib/stores/editor-store';

export function useKeyboardShortcuts() {
  const {
    togglePlay,
    undo,
    redo,
    canUndo,
    canRedo,
    removeLayer,
    selectedLayerIds,
    pause,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Spacebar - Play/Pause
      if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault();
        togglePlay();
      }

      // Undo - Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Redo - Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Delete - Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerIds.length > 0) {
        e.preventDefault();
        selectedLayerIds.forEach((id) => removeLayer(id));
      }

      // Escape - Pause and deselect
      if (e.key === 'Escape') {
        pause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, undo, redo, canUndo, canRedo, removeLayer, selectedLayerIds, pause]);
}

