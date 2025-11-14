import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentState, AgentStateAnnotation, AgentInputAnnotation } from '../state.js';
import { AgentConfig, DEFAULT_CONFIG } from '../config/types.js';
import { createSupervisorSubgraph } from './supervisorSubgraph.js';
import { clarifyWithUser } from '../nodes/clarifyWithUser.js';
import { writeResearchBrief } from '../nodes/writeResearchBrief.js';
import { generateFinalReport } from '../nodes/generateFinalReport.js';
import { graphNodes } from '../utils/constants.js';

/**
 * Creates the main research workflow graph
 *
 * Flow: start -> clarify -> writeResearchBrief -> conductResearch (loop) -> finalReport
 *
 * @param config - The agent configuration.
 * @returns The compiled workflow.
 */
export function createMainWorkflow(config: AgentConfig) {
  const supervisorSubgraph = createSupervisorSubgraph(config);

  const workflow = new StateGraph(AgentStateAnnotation, {
    input: AgentInputAnnotation
  })
    .addNode(graphNodes.clarifyWithUser, async (state: AgentState) => {
      return await clarifyWithUser(state, config);
    }, { ends: [graphNodes.writeResearchBrief, END] })
    .addNode(graphNodes.writeResearchBrief, async (state: AgentState) => {
      return await writeResearchBrief(state, config);
    }, { ends: [graphNodes.conductResearch] })
    .addNode(graphNodes.conductResearch, supervisorSubgraph)
    .addNode(graphNodes.generateFinalReport, async (state: AgentState) => {
      return await generateFinalReport(state, config);
    })
    .addEdge(START, graphNodes.clarifyWithUser)
    .addEdge(graphNodes.conductResearch, graphNodes.generateFinalReport)
    .addEdge(graphNodes.generateFinalReport, END);

  return workflow.compile();
}

export const graph = createMainWorkflow(DEFAULT_CONFIG);