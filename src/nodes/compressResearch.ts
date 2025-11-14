import { AgentConfig } from '../config/types.js';
import { formatCompressPrompt, COMPRESS_RESEARCH_SIMPLE_MESSAGE } from '../prompts/compress.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ResearcherOutputState } from '../state.js';
import { createModel } from '../utils/model-factory.js';

/**
 * Compress research node - compresses research findings into a concise summary
 */
export async function compressResearch(
  state: any,
  config: AgentConfig
): Promise<ResearcherOutputState> {
  try {
    const modelConfig = config.compressionModel || config.model;
    const model = createModel(modelConfig);

    const researcherMessages = state.researcherMessages || [];

    const messagesWithInstruction = [
      ...researcherMessages.slice(0, -2),
      new SystemMessage({ content: COMPRESS_RESEARCH_SIMPLE_MESSAGE }),
      ...researcherMessages.slice(-2),
    ];

    const prompt = formatCompressPrompt(messagesWithInstruction.map(m => m.content).join('\n'));
    const response = await model.invoke([new HumanMessage({ content: prompt })]);

    const compressedFindings = String(response.content);
    console.log(`  Compressed findings to ${compressedFindings.length} chars`);

    return {
      compressedResearch: compressedFindings,
      rawNotes: [compressedFindings],
    };
  } catch (error) {
    console.error('Compression error:', error);
    const fallbackSummary = `Research findings from: ${state.researchTopic || 'Unknown topic'}`;
    return {
      compressedResearch: fallbackSummary,
      rawNotes: [fallbackSummary],
    };
  }
}