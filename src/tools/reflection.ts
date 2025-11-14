import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { toolNames } from '../utils/constants.js';

/**
 * Think tool - allows the supervisor to reflect and plan strategy
 * 
 * This tool enables the supervisor to:
 * - Reflect on what has been learned so far
 * - Identify gaps in current knowledge
 * - Plan next research steps strategically
 * - Evaluate research progress
 * 
 * The think tool does not execute any actions - it simply records
 * the supervisor's strategic thinking for context and planning.
 */
export const reflectionTool = new DynamicStructuredTool({
  name: toolNames.reflection,
  description: 'Use this tool to think strategically about research progress and plan next steps. Record your reflections about what has been learned, what gaps remain, and what research should be conducted next.',
  schema: z.object({
    reflection: z.string().describe('Your strategic thoughts about research progress, gaps, and next steps'),
  }),
  func: async ({ reflection }) => {
    return `Reflection recorded: ${reflection}`;
  },
});

