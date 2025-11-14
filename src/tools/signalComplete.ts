import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { toolNames } from '../utils/constants.js';

/**
 * Research Complete tool - signals that research is sufficient
 * 
 * This tool should be called by the supervisor when:
 * - All critical aspects of the research brief have been covered
 * - Sufficient depth and breadth has been achieved
 * - Additional research would yield diminishing returns
 * - The gathered information is sufficient to generate a comprehensive report
 * 
 * Calling this tool triggers the end of the research phase and
 * initiates final report generation.
 * 
 * Only use this tool when you are confident that the research
 * adequately addresses all aspects of the original request.
 */
export const signalCompleteTool = new DynamicStructuredTool({
  name: toolNames.signalComplete,
  description: 'Signal that research is complete and sufficient to address the research brief. Only use this when you have gathered comprehensive information covering all critical aspects.',
  schema: z.object({
    summary: z.string().describe('Brief summary of why research is complete'),
  }),
  func: async ({ summary }) => {
    return `Research marked as complete: ${summary}`;
  },
});

