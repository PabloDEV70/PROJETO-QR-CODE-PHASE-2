export interface GistFile {
  filename: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string;
}

export interface Gist {
  id: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
}

export interface GistCreatePayload {
  description: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

export interface SavedQuery {
  gistId: string;
  filename: string;
  description: string;
  sql: string;
  updatedAt: string;
}
