/**
 * Editor state types - shared between frontend and backend
 */

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type LayerType = 'video' | 'image' | 'text' | 'audio';

export type TransitionType = 'cut' | 'fade' | 'zoom' | 'slide' | 'wipe';

export type AnimationType = 'none' | 'fade' | 'slide' | 'typewriter' | 'zoom';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TimeRange {
  start: number; // seconds
  end: number; // seconds
}

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  startTime: number; // seconds
  duration: number; // seconds
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-1
  zIndex: number;
}

export interface VideoLayer extends BaseLayer {
  type: 'video';
  mediaId: string;
  src: string;
  trimStart: number; // seconds
  trimEnd: number; // seconds
  position: Position;
  scale: number; // 1.0 = 100%
  rotation: number; // degrees
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  mediaId: string;
  src: string;
  position: Position;
  scale: number;
  rotation: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  backgroundColor?: string;
  position: Position;
  alignment: 'left' | 'center' | 'right';
  animation: AnimationType;
  animationDuration?: number;
}

export interface AudioLayer extends BaseLayer {
  type: 'audio';
  mediaId: string;
  src: string;
  trimStart: number;
  trimEnd: number;
  volume: number; // 0-1
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

export type Layer = VideoLayer | ImageLayer | TextLayer | AudioLayer;

export interface Transition {
  id: string;
  fromLayerId: string;
  toLayerId: string;
  type: TransitionType;
  duration: number; // seconds
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  animation: AnimationType;
  wordByWord: boolean;
}

export interface EditorState {
  version: string;
  aspectRatio: AspectRatio;
  resolution: Size;
  duration: number; // total duration in seconds
  fps: number;
  layers: Layer[];
  transitions: Transition[];
  captionStyle?: CaptionStyle;
  backgroundMusic?: {
    mediaId: string;
    src: string;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
  };
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface EditorSelection {
  layerIds: string[];
  timeRange?: TimeRange;
}

