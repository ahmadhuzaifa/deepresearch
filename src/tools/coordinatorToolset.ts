/**
 * Coordinator Toolset
 *
 * This module exports all tools available to the research coordinator for
 * strategic research coordination:
 *
 * - reflectionTool: For strategic reflection and planning
 * - delegateResearchTool: For delegating research to subagents
 * - signalCompleteTool: For signaling research completion
 */

import { reflectionTool } from './reflection.js';
import { delegateResearchTool } from './delegateResearch.js';
import { signalCompleteTool } from './signalComplete.js';

export { reflectionTool } from './reflection.js';
export { delegateResearchTool } from './delegateResearch.js';
export { signalCompleteTool } from './signalComplete.js';

export const coordinatorToolset = [
  reflectionTool,
  delegateResearchTool,
  signalCompleteTool
];

