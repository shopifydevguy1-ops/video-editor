'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/stores/editor-store';
import { WordTimestamp } from '@ai-video-editor/shared';

interface CaptionRendererProps {
  layerId: string;
  wordTimestamps: WordTimestamp[];
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    position: 'top' | 'center' | 'bottom';
    animation: 'word-by-word' | 'sentence' | 'fade';
  };
}

export function CaptionRenderer({
  layerId,
  wordTimestamps,
  style,
}: CaptionRendererProps) {
  const { currentTime, editorState } = useEditorStore();
  const [visibleWords, setVisibleWords] = useState<string[]>([]);

  useEffect(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return;

    if (style.animation === 'word-by-word') {
      const words = wordTimestamps.filter(
        (wt) => currentTime >= wt.start && currentTime <= wt.end,
      );
      setVisibleWords(words.map((w) => w.word));
    } else if (style.animation === 'sentence') {
      const currentWord = wordTimestamps.find(
        (wt) => currentTime >= wt.start && currentTime <= wt.end,
      );
      if (currentWord) {
        const sentenceStart = wordTimestamps.findIndex((wt) => wt === currentWord);
        const sentenceEnd = wordTimestamps.findIndex(
          (wt, idx) => idx > sentenceStart && wt.word.endsWith('.'),
        );
        const sentence = wordTimestamps.slice(
          sentenceStart,
          sentenceEnd === -1 ? wordTimestamps.length : sentenceEnd + 1,
        );
        setVisibleWords(sentence.map((w) => w.word));
      }
    } else {
      // Fade - show all words
      setVisibleWords(wordTimestamps.map((w) => w.word));
    }
  }, [currentTime, wordTimestamps, style.animation]);

  if (!editorState || visibleWords.length === 0) return null;

  const getPosition = () => {
    const { height } = editorState.resolution;
    switch (style.position) {
      case 'top':
        return { top: '10%' };
      case 'center':
        return { top: '50%', transform: 'translateY(-50%)' };
      case 'bottom':
        return { bottom: '10%' };
      default:
        return { bottom: '10%' };
    }
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-50"
      style={{
        ...getPosition(),
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        color: style.color,
      }}
    >
      <div
        className="px-4 py-2 rounded"
        style={{
          backgroundColor: style.backgroundColor || 'rgba(0,0,0,0.7)',
        }}
      >
        {style.animation === 'word-by-word' ? (
          <span>
            {visibleWords.map((word, idx) => (
              <span
                key={idx}
                className="inline-block animate-fade-in"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                {word}{' '}
              </span>
            ))}
          </span>
        ) : (
          <span>{visibleWords.join(' ')}</span>
        )}
      </div>
    </div>
  );
}

