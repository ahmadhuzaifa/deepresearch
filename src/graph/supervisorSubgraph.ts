import { StateGraph, START, END } from '@langchain/langgraph';
import { ResearchLoopState, ResearchLoopStateAnnotation } from '../state.js';
import { AgentConfig } from '../config/types.js';
import { researchCoordinator } from '../nodes/researchCoordinator.js';
import { coordinatorTools } from '../nodes/coordinatorTools.js';
import { graphNodes } from '../utils/constants.js';

/**
 * Creates the supervisor subgraph for iterative research coordination
 *
 * Flow: START -> researchCoordinator -> coordinatorTools -> (loop back to researchCoordinator OR end)
 * The tools use Command pattern to dynamically route
 */
export function createSupervisorSubgraph(config: AgentConfig) {
  const { researchLoop } = graphNodes;

  const workflow = new StateGraph(ResearchLoopStateAnnotation)
    .addNode(researchLoop.researchCoordinator, async (state: ResearchLoopState) => {
      return await researchCoordinator(state, config);
    })
    .addNode(researchLoop.coordinatorTools, async (state: ResearchLoopState) => {
      return await coordinatorTools(state, config);
    }, { ends: [researchLoop.researchCoordinator, END] })
    .addEdge(START, researchLoop.researchCoordinator)
    .addEdge(researchLoop.researchCoordinator, researchLoop.coordinatorTools);

  return workflow.compile();
}