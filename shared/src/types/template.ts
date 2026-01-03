/**
 * Template system types
 */

import { CaptionStyle, TransitionType } from './editor';

export type TemplateCategory = 'viral' | 'explainer' | 'listicle' | 'quote' | 'custom';

export type CaptionStyleType = 'word-by-word' | 'sentence' | 'minimal';

export type VisualMotionType = 'static' | 'slow-zoom' | 'ken-burns';

export type BackgroundType = 'stock' | 'animated' | 'gradient';

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  description?: string;
  previewUrl?: string;
  
  // Caption settings
  captions: {
    style: CaptionStyleType;
    fontFamily: string;
    fontSize: number;
    position: 'top' | 'center' | 'bottom';
    animation: CaptionStyle['animation'];
    color: string;
    backgroundColor?: string;
  };
  
  // Cut settings
  cuts: {
    frequency: number; // seconds between cuts
    transition: TransitionType;
    transitionDuration: number; // seconds
  };
  
  // Audio settings
  audio: {
    musicVolume: number; // 0-1
    narrationVolume: number; // 0-1
    ducking: boolean; // Lower music during speech
    duckingAmount?: number; // 0-1, how much to lower music
  };
  
  // Visual settings
  visuals: {
    zoomLevel: number; // 1.0 = no zoom, 1.2 = 20% zoom
    motion: VisualMotionType;
    backgroundType: BackgroundType;
  };
  
  // Scene structure
  sceneStructure: {
    hookDuration: number; // First N seconds
    hookStyle: 'bold-text' | 'fast-cuts' | 'question';
    mainContentStyle: 'explainer' | 'list' | 'story';
  };
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description?: string;
  previewUrl?: string;
  config: TemplateConfig;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

