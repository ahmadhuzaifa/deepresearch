import { iSearchTool, SearchResponse, SearchResult } from '../interface.js';

export class MockSearchTool implements iSearchTool {
  name = 'mock_search';

  async search(query: string, maxResults: number = 5): Promise<SearchResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockResults: SearchResult[] = Array.from({ length: Math.min(maxResults, 3) }, (_, i) => ({
      title: `Mock Result ${i + 1} for: ${query}`,
      url: `https://example.com/result-${i + 1}`,
      snippet: `This is a mock search result for the query "${query}". It contains relevant information that would typically be found on the web.`,
      content: `Full content for mock result ${i + 1}. This would contain detailed information about the search query: ${query}. The content would be much longer in a real scenario and provide comprehensive information about the topic.`,
      score: 0.9 - (i * 0.1)
    }));

    return {
      query,
      results: mockResults,
      totalResults: mockResults.length,
      searchTime: 100
    };
  }
}

