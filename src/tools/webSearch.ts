import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createSearchService } from '../search/index.js';
import { SearchConfig } from '../config/types.js';
import { toolNames } from '../utils/constants.js';

/**
 * Creates a web search tool for the supervisor to use
 * 
 * @param config - The search configuration
 * @returns The langchain compatible web search tool
 */
export function createWebSearchTool(config: SearchConfig) {
  const searchService = createSearchService(config);
  
  return new DynamicStructuredTool({
    name: toolNames.webSearch,
    description: 'Use this tool to search the web for information',
    schema: z.object({
      query: z.string().describe('The search query to look up'),
    }),
    func: async (args: { query?: string }) => {
      const query = args.query || '';
      const result = await searchService.search(query);
      return JSON.stringify(result, null, 2);
    },
  });
}

