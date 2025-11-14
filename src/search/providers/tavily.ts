import { iSearchTool, SearchResponse } from '../interface.js';
import { SearchConfig } from '../../config/types.js';

/**
 * Tavily search tool
 * @implements iSearchTool
 */
export class TavilySearchTool implements iSearchTool {
  name = 'tavily_search';

  /**
   * Constructor
   * @param config - The search configuration
   */
  constructor(private config: SearchConfig) {}

  /**
   * Search the web using the Tavily API
   * @param query - The query to search for
   * @param maxResults - The maximum number of results to return
   * @returns The search response
   */
  async search(query: string, maxResults?: number): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query,
          search_depth: 'advanced',
          include_answer: false,
          include_images: false,
          include_raw_content: true,
          max_results: maxResults || this.config.maxResults
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();
      const searchTime = Date.now() - startTime;

      return {
        query,
        results: data.results?.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.content || result.raw_content?.substring(0, 500),
          content: result.raw_content?.substring(0, 2000) || result.content,
          score: result.score,
          publishedDate: result.published_date
        })) || [],
        totalResults: data.results?.length || 0,
        searchTime
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime
      };
    }
  }
}

