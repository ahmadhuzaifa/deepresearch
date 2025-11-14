import { iSearchTool } from './interface.js';
import { TavilySearchTool } from './providers/tavily.js';
import { MockSearchTool } from './providers/mock.js';
import { SearchConfig } from '../config/types.js';

// Re-export types
export * from './interface.js';
export { TavilySearchTool } from './providers/tavily.js';
export { MockSearchTool } from './providers/mock.js';

/**
 * Factory function to create a search service based on configuration
 */
export function createSearchService(config: SearchConfig): iSearchTool {
  switch (config.provider) {
    case 'tavily':
      return new TavilySearchTool(config);
    default:
      console.warn(`Unknown search provider: ${config.provider}, using mock search`);
      return new MockSearchTool();
  }
}

