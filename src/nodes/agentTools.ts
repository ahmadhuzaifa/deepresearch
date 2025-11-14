import { AgentConfig } from '../config/types.js';
import { createWebSearchTool } from '../tools/webSearch.js';
import { reflectionTool } from '../tools/reflection.js';
import { ToolMessage } from '@langchain/core/messages';
import { ResearcherState } from '../state.js';
import { Command } from '@langchain/langgraph';
import { graphNodes } from '../utils/constants.js';

/**
 * Execute tools called by the researcher, including search tools and strategic thinking.
 *
 * This function handles various types of researcher tool calls:
 * 1. reflection - Strategic reflection that continues the research conversation
 * 2. Search tools - Information gathering
 * 3. Routes to either continue research or proceed to compression based on conditions
 *
 * @param state - The researcher state
 * @param config - The agent configuration
 * @returns Command to route to researchAgent or compressResearch
 */
export async function agentTools(
  state: ResearcherState,
  config: AgentConfig
): Promise<Command> {
  try {
    // Step 1: Extract current state and check early exit conditions
    const researcherMessages = state.researcherMessages || [];
    const lastMessage = researcherMessages[researcherMessages.length - 1];
    const toolCallIterations = state.toolCallIterations || 0;

    // Early exit if no tool calls were made
    if (!lastMessage || !('tool_calls' in lastMessage) || !(lastMessage as any).tool_calls?.length) {
      console.log('  No tool calls to execute - proceeding to compression');
      return new Command({
        goto: graphNodes.researchTasks.compressResearch
      });
    }

    // Step 2: Execute all tool calls
    const webSearchTool = createWebSearchTool(config.search);
    const toolsByName = {
      [webSearchTool.name]: webSearchTool,
      [reflectionTool.name]: reflectionTool,
    };

    const toolMessages: ToolMessage[] = [];
    const toolCalls = (lastMessage as any).tool_calls || [];

    for (const toolCall of toolCalls) {
      const tool = toolsByName[toolCall.name];
      if (!tool) {
        console.error(`Tool not found: ${toolCall.name}`);
        continue;
      }

      try {
        console.log(`  Executing: ${toolCall.name}`);
        const result = await tool.func(toolCall.args);

        toolMessages.push(new ToolMessage({
          content: result,
          tool_call_id: toolCall.id,
          name: toolCall.name,
        }));
      } catch (error) {
        console.error(`  Tool execution error (${toolCall.name}):`, error);
        toolMessages.push(new ToolMessage({
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          tool_call_id: toolCall.id,
          name: toolCall.name,
        }));
      }
    }

    // Step 3: Check exit conditions after processing tools
    const maxIterations = config.maxReactToolCalls || 15;
    const exceededIterations = toolCallIterations >= maxIterations;

    // Check if research complete was called (if this tool exists in the future)
    // const researchCompleteCall = toolCalls.some((call: any) => call.name === 'research_complete');

    if (exceededIterations) {
      console.log(`  Max iterations (${maxIterations}) reached - proceeding to compression`);
      return new Command({
        goto: graphNodes.researchTasks.compressResearch,
        update: {
          researcherMessages: [...researcherMessages, ...toolMessages]
        }
      });
    }

    // Step 4: Continue research loop with tool results
    return new Command({
      goto: graphNodes.researchTasks.researchAgent,
      update: {
        researcherMessages: [...researcherMessages, ...toolMessages]
      }
    });
  } catch (error) {
    console.error('Researcher tools error:', error);
    // On error, proceed to compression with whatever data we have
    return new Command({
      goto: graphNodes.researchTasks.compressResearch
    });
  }
}