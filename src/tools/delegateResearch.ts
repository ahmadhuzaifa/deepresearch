import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { toolNames } from '../utils/constants.js';

/**
 * Conduct Research tool - delegates research to a specialized researcher
 * 
 * This tool allows the supervisor to delegate focused research tasks
 * to individual researcher subagents. Each research task should have
 * a clear, specific objective.
 * 
 * The actual research execution is handled by the supervisor_tools node,
 * which spawns researcher subgraphs for each ConductResearch call.
 * 
 * Best practices:
 * - Make research topics specific and focused
 * - Avoid redundant research on already-covered topics
 * - Break complex questions into manageable subtasks
 * - Delegate complementary tasks that can run in parallel
 */
export const delegateResearchTool = new DynamicStructuredTool({
  name: toolNames.delegateResearch,
  description: 'Delegate a focused research task to a specialized researcher. Use this to investigate specific aspects or gather information on particular topics. Each research task should have a clear, specific objective.',
  schema: z.object({
    research_topic: z.string().describe('A clear, specific research objective or question to investigate'),
  }),
  func: async ({ research_topic }) => {
    // This will be handled specially in supervisor_tools node
    // We just return a placeholder here
    return `Research delegated: ${research_topic}`;
  },
});

