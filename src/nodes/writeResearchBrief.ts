import { z } from 'zod';
import { Command } from '@langchain/langgraph';
import { AgentState } from '../state.js';
import { formatPlanPrompt } from '../prompts/plan.js';
import { formatSupervisorPrompt } from '../prompts/supervisor.js';
import { AgentConfig } from '../config/types.js';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { graphNodes } from '../utils/constants.js';
import { createModel } from '../utils/model-factory.js';

const PlanSchema = z.object({
  researchBrief: z.string(),
});

/**
 * Write research brief node - transforms user messages into a structured research brief
 * and initializes the research loop with supervisor context
 * 
 * Uses Command pattern to route to conduct_research (research loop)
 */
export async function writeResearchBrief(
  state: AgentState,
  config: AgentConfig
): Promise<Command> {
  try {
    const model = createModel(config.model);

    // Use structured output for research brief generation
    const structuredModel = model.withStructuredOutput(PlanSchema);

    // Format messages for research brief generation
    const messagesString = state.messages
      .map(msg => `${msg._getType()}: ${msg.content}`)
      .join('\n');

    const prompt = formatPlanPrompt(
      messagesString,
      new Date().toISOString().split('T')[0]
    );

    const response = await structuredModel.invoke(prompt);
    const researchBrief = response.researchBrief;

    console.log('\n📋 Research Brief Created:');
    console.log(researchBrief);

    const supervisorSystemPrompt = formatSupervisorPrompt(
      new Date().toISOString().split('T')[0],
      config.maxConcurrentResearchUnits || 3,
      config.maxResearcherIterations || 10
    );

    return new Command({
      goto: graphNodes.conductResearch,
      update: {
        researchBrief,
        researchLoopMessages: [
          new SystemMessage({ content: supervisorSystemPrompt }),
          new HumanMessage({ content: researchBrief })
        ],
        researchIterations: 0,
        notes: [],
        rawNotes: [],
      }
    });
  } catch (error) {
    console.error('Research brief generation error:', error);
    throw new Error(`Failed to generate research brief: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

