export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  score?: number;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults?: number;
  searchTime?: number;
}

/**
 * Search tool interface
 */
export interface iSearchTool {
  /**
   * The name of the search tool
   */
  name: string;
  
  /**
   * Search the web using the search tool
   * @param query - The query to search for
   * @param maxResults - The maximum number of results to return
   * @returns The search response
   */
  search(query: string, maxResults?: number): Promise<SearchResponse>;
}

