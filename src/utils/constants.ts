/**
 * Constants for node names and routing decisions across the research workflow
 */
export const graphNodes = {
  clarifyWithUser: 'clarify_with_user',
  writeResearchBrief: 'write_research_brief',
  conductResearch: 'conduct_research',
  generateFinalReport: 'generate_final_report',

  researchLoop: {
    researchCoordinator: 'research_coordinator',
    coordinatorTools: 'coordinator_tools',
  },
  researchTasks: {
    researchAgent: 'research_agent',
    agentTools: 'agent_tools',
    compressResearch: 'compress_research',
  },
} as const;

/**
 * Constants for tool names across the research workflow
 */
export const toolNames = {
  delegateResearch: 'delegate_research',
  signalComplete: 'signal_complete',
  reflection: 'reflection',
  webSearch: 'web_search',
} as const;

