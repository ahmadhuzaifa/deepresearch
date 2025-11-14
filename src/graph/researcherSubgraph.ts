import { StateGraph, START, END } from '@langchain/langgraph';
import {
  ResearcherState,
  ResearcherStateAnnotation,
  ResearcherOutputStateAnnotation,
} from '../state.js';
import { AgentConfig } from '../config/types.js';
import { HumanMessage } from '@langchain/core/messages';
import { researchAgent } from '../nodes/researchAgent.js';
import { agentTools } from '../nodes/agentTools.js';
import { compressResearch } from '../nodes/compressResearch.js';
import { graphNodes } from '../utils/constants.js';

/**
 * Creates the researcher subgraph for conducting focused research on a single topic
 */
export function createResearcherSubgraph(config: AgentConfig) {
  const { researchTasks: RESEARCHER_NODES } = graphNodes;

  const builder = new StateGraph(ResearcherStateAnnotation, { output: ResearcherOutputStateAnnotation })
    .addNode(RESEARCHER_NODES.researchAgent, async (state: ResearcherState) => researchAgent(state, config))
    .addNode(
      RESEARCHER_NODES.agentTools,
      async (state: ResearcherState) => agentTools(state, config),
      {
        ends: [RESEARCHER_NODES.researchAgent, RESEARCHER_NODES.compressResearch]
      }
    )
    .addNode(RESEARCHER_NODES.compressResearch, async (state: ResearcherState) => compressResearch(state, config), {
      ends: [END]
    })
    .addEdge(START, RESEARCHER_NODES.researchAgent)
    .addEdge(RESEARCHER_NODES.researchAgent, RESEARCHER_NODES.agentTools)
    .addEdge(RESEARCHER_NODES.compressResearch, END);

  return builder.compile();
}

/**
 * Execute a research task and return compressed findings
 */
export async function executeResearchTask(
  researchTopic: string,
  config: AgentConfig
) {
  console.log(`\n🔍 Starting research: ${researchTopic}`);

  const subgraph = createResearcherSubgraph(config);

  const initialState: ResearcherState = {
    researchTopic,
    researcherMessages: [new HumanMessage({ content: researchTopic })],
    toolCallIterations: 0,
    rawNotes: [],
  };

  const result = await subgraph.invoke(initialState, {
    recursionLimit: config.maxReactToolCalls || 15,
  });

  console.log(`✅ Research completed for: ${researchTopic}`);

  return result;
}