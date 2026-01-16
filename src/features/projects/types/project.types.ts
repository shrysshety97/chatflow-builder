// Project feature types
export interface Project {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  systemPrompt?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  systemPrompt?: string;
}
