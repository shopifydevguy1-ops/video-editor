/**
 * Project types
 */

import { EditorState } from './editor';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  editorState: EditorState;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  aspectRatio: EditorState['aspectRatio'];
  resolution?: EditorState['resolution'];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  editorState?: Partial<EditorState>;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  aspectRatio: EditorState['aspectRatio'];
  createdAt: Date;
  updatedAt: Date;
}

