import { z } from 'zod';
import { Command, END } from '@langchain/langgraph';
import { AgentState } from '../state.js';
import { formatClarifyPrompt } from '../prompts/clarify.js';
import { AgentConfig } from '../config/types.js';
import { AIMessage, getBufferString } from '@langchain/core/messages';
import { graphNodes } from '../utils/constants.js';
import { createModel } from '../utils/model-factory.js';

/**
 * Whether the agent requires clarification
 * If so, the agent will ask a question to the user
 * If not, the agent will proceed to the next node
 */
const ClarificationSchema = z.object({
  need_clarification: z.boolean().describe("Whether clarification is needed from the user"),
  question: z.string().nullable().describe("The clarification question to ask if needed, null otherwise"),
  verification: z.string().nullable().describe("Verification of understanding if no clarification needed, null otherwise"),
});

/**
 * Determines if clarification is needed before research
 * 
 * @param state - The agent state
 * @param config - The agent configuration
 * @returns The updated agent state
 */
export async function clarifyWithUser(
  state: AgentState,
  config: AgentConfig
): Promise<Command> {
  try {
    if (!config.allowClarification) {
      return new Command({
        goto: graphNodes.writeResearchBrief
      });
    }

    const model = createModel(config.model);
    const structuredModel = model.withStructuredOutput(ClarificationSchema);

    const messagesString = getBufferString(state.messages);
    const prompt = formatClarifyPrompt(
      messagesString,
      new Date().toISOString().split('T')[0]
    );

    const response = await structuredModel.invoke(prompt);

    if (response.need_clarification && response.question) {
      console.log('Clarification needed, asking user...');
      return new Command({
        goto: END,
        update: {
          messages: [new AIMessage({ content: response.question })]
        }
      });
    } else {
      console.log('No clarification needed, proceeding to research brief');
      return new Command({
        goto: graphNodes.writeResearchBrief,
        update: response.verification ? {
          messages: [new AIMessage({ content: response.verification })]
        } : {}
      });
    }
  } catch (error) {
    console.error('Clarification error:', error);
    return new Command({
      goto: graphNodes.writeResearchBrief
    });
  }
}

