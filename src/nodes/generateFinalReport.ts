import { AgentState } from '../state.js';
import { formatFinalReportPrompt } from '../prompts/finalReport.js';
import { AgentConfig } from '../config/types.js';
import { HumanMessage, AIMessage, getBufferString } from '@langchain/core/messages';
import { createModel } from '../utils/model-factory.js';

/**
 * Final report generation node - synthesizes all research into comprehensive report
 */
export async function generateFinalReport(
  state: AgentState,
  config: AgentConfig
): Promise<Partial<AgentState>> {
  try {
    const model = createModel(config.model);

    const researchBrief = state.researchBrief || 'No research brief available';
    const notes = state.notes || [];
    const findings = notes.join('\n\n---\n\n');

    const messagesString = getBufferString(state.messages);

    console.log('\n📝 Generating final report...');
    console.log(`  Research brief length: ${researchBrief.length} chars`);
    console.log(`  Number of research findings: ${notes.length}`);
    console.log(`  Total findings length: ${findings.length} chars`);

    let finalReport: string;
    let currentFindings = findings;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const prompt = formatFinalReportPrompt(
          researchBrief,
          messagesString,
          currentFindings,
          new Date().toISOString().split('T')[0]
        );

        const response = await model.invoke([new HumanMessage({ content: prompt })]);
        finalReport = String(response.content);
        
        console.log(`✅ Final report generated (${finalReport.length} characters)`);
        
        return {
          finalReport,
          messages: [...state.messages, new AIMessage({ content: finalReport })],
          notes: [],
        };
      } catch (error: any) {
        if (error.message?.includes('token') || error.message?.includes('context')) {
          console.warn(`⚠️  Token limit exceeded on attempt ${attempt + 1}, truncating findings...`);
          currentFindings = currentFindings.substring(0, Math.floor(currentFindings.length * 0.9));
          
          if (attempt === maxRetries - 1) {
            throw new Error('Failed to generate report after token limit retries');
          }
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to generate report after all retries');
  } catch (error) {
    console.error('Final report generation error:', error);
    
    const fallbackReport = `# Research Report
## Error

Failed to generate comprehensive report: ${error instanceof Error ? error.message : 'Unknown error'}

## Research Brief

${state.researchBrief || 'No research brief available'}

## Research Findings

${(state.notes || []).join('\n\n---\n\n')}

*Note: This is a fallback report due to an error during report generation.*`;

    return {
      finalReport: fallbackReport,
      messages: [...state.messages, new AIMessage({ content: fallbackReport })],
      error: `Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      notes: [],
    };
  }
}

