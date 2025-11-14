import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

/**
 * Annotation for the agent input (for Chat interface)
 */
export const AgentInputAnnotation = Annotation.Root({
  messages: MessagesAnnotation.spec["messages"]
});

/**
 * Main agent state annotation for the research workflow
 */
export const AgentStateAnnotation = Annotation.Root({
  ...AgentInputAnnotation.spec,
  researchBrief: Annotation<string | undefined>(),
  researchLoopMessages: Annotation<BaseMessage[]>(),
  researchIterations: Annotation<number>(),
  notes: Annotation<string[]>(),
  rawNotes: Annotation<string[]>(),
  finalReport: Annotation<string | undefined>(),
  error: Annotation<string | undefined>()
});

/**
 * Research loop state annotation (for the iterative research coordination subgraph)
 */
export const ResearchLoopStateAnnotation = Annotation.Root({
  researchBrief: Annotation<string>(),
  researchLoopMessages: Annotation<BaseMessage[]>(),
  researchIterations: Annotation<number>(),
  notes: Annotation<string[]>(),
  rawNotes: Annotation<string[]>()
});

/**
 * Researcher (subagent) state annotation
 */
export const ResearcherStateAnnotation = Annotation.Root({
  researchTopic: Annotation<string>(),
  researcherMessages: Annotation<BaseMessage[]>(),
  toolCallIterations: Annotation<number>(),
  rawNotes: Annotation<string[]>()
});

/**
 * Researcher output annotation (after compression)
 */
export const ResearcherOutputStateAnnotation = Annotation.Root({
  compressedResearch: Annotation<string>(),
  rawNotes: Annotation<string[]>()
});

// Infer TypeScript types from annotations
export type AgentInputState = typeof AgentInputAnnotation.State;
export type AgentState = typeof AgentStateAnnotation.State;
export type ResearchLoopState = typeof ResearchLoopStateAnnotation.State;
export type ResearcherState = typeof ResearcherStateAnnotation.State;
export type ResearcherOutputState = typeof ResearcherOutputStateAnnotation.State;
