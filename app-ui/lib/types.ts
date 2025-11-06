/**
 * TypeScript типы для RAG-UX Researcher UI
 */

export type Mode = "online" | "offline";
export type QueryType = "text" | "image";

export interface SearchRequest {
  mode: Mode;
  queryType: QueryType;
  query?: string;
  fileIds?: string[];
  filters?: {
    iteration?: string;
    scenario?: string;
    date?: string;
  };
}

export interface QuoteMetadata {
  id: string;
  title: string;
  iteration: string;
  date: string;
  filename: string;
  section_path: string;
  chunk_index: number;
  product: string;
}

export interface Quote {
  id: string;
  text: string;
  metadata: QuoteMetadata;
  distance?: number;
}

export interface Source {
  id: string;
  title: string;
  date: string;
  iteration: string;
}

export interface Image {
  path: string;
  alt?: string;
  source_id: string;
}

export interface SearchResponse {
  summary: string;
  quotes: Quote[];
  sources: Source[];
  images: Image[];
}

export interface FollowupRequest {
  threadId: string;
  query: string;
}

export interface FollowupResponse extends SearchResponse {
  threadId: string;
  answerId: string;
}

export interface AnswerResponse extends SearchResponse {
  id: string;
  createdAt: string;
  mode: Mode;
}

export interface SearchFilters {
  iteration?: string;
  scenario?: string;
  date?: string;
}





