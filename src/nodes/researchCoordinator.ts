import { ResearchLoopState } from '../state.js';
import { AgentConfig } from '../config/types.js';
import { coordinatorToolset } from '../tools/coordinatorToolset.js';
import { AIMessage, ToolCall } from '@langchain/core/messages';
import { createModel } from '../utils/model-factory.js';

/**
 * Research coordinator node - decides what research tasks to delegate next
 * Returns the AI message with tool calls and updated iteration count
 */
export async function researchCoordinator(
  state: ResearchLoopState,
  config: AgentConfig
): Promise<Partial<ResearchLoopState>> {
  try {
    const model = createModel(config.model);

    const modelWithTools = model.bindTools ? model.bindTools(coordinatorToolset) : model;

    const researchLoopMessages = state.researchLoopMessages || [];
    const response = await modelWithTools.invoke(researchLoopMessages);

    console.log(`\nResearch supervisor iteration ${(state.researchIterations || 0) + 1}`);
    
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log('Tool calls:');
      response.tool_calls.forEach((call: ToolCall) => {
        console.log(`  - ${call.name}: ${JSON.stringify(call.args).substring(0, 100)}...`);
      });
    } else {
      console.log('No tool calls (continuing conversation)');
    }

    return {
      researchLoopMessages: [...researchLoopMessages, response as AIMessage],
      researchIterations: (state.researchIterations || 0) + 1,
    };
  } catch (error) {
    console.error('Research supervisor error:', error);
    throw new Error(`Research supervisor failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

