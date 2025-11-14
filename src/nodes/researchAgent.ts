import { AgentConfig } from '../config/types.js';
import { createWebSearchTool } from '../tools/webSearch.js';
import { reflectionTool } from '../tools/reflection.js';
import { formatResearcherPrompt } from '../prompts/researcher.js';
import { SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { ResearcherState } from '../state.js';
import { createModel } from '../utils/model-factory.js';

/**
 * Compress messages to fit within token limits
 */
function compressMessages(messages: BaseMessage[], maxMessages: number = 10): BaseMessage[] {
  if (messages.length <= maxMessages) {
    return messages;
  }

  // Keep the first (system) message and the most recent messages
  const systemMessage = messages[0];
  const recentMessages = messages.slice(-maxMessages + 1);

  return [systemMessage, ...recentMessages];
}

/**
 * Conducts focused research using available tools
 *
 * @param state - The researcher state
 * @param config - The agent configuration
 * @returns The updated researcher state
 */
export async function researchAgent(
  state: ResearcherState,
  config: AgentConfig
): Promise<Partial<ResearcherState>> {
  try {
    const model = createModel(config.model);

    const webSearchTool = createWebSearchTool(config.search);
    const tools = [webSearchTool, reflectionTool];

    const modelWithTools = model.bindTools ? model.bindTools(tools) : model;

    const systemPrompt = formatResearcherPrompt(
      new Date().toISOString().split('T')[0]
    );

    const researcherMessages = state.researcherMessages || [];

    // Compress messages to prevent token overflow
    const allMessages = [
      new SystemMessage({ content: systemPrompt }),
      ...researcherMessages
    ];
    const compressedMessages = compressMessages(allMessages, 8);

    const response = await modelWithTools.invoke(compressedMessages);
    const toolCallIterations = (state.toolCallIterations || 0) + 1;

    console.log(`Researcher iteration ${toolCallIterations}/${config.maxReactToolCalls || 15}`);

    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`Tool calls: ${response.tool_calls.map(tc => tc.name).join(', ')}`);
    }

    return {
      researcherMessages: [...researcherMessages, response as AIMessage],
      toolCallIterations,
    };
  } catch (error) {
    console.error('Researcher error:', error);
    throw new Error(`Researcher failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}