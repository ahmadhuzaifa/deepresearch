import { ResearchLoopState } from '../state.js';
import { AgentConfig } from '../config/types.js';
import { executeResearchTask } from '../graph/researcherSubgraph.js';
import { ToolMessage, AIMessage, BaseMessage, ToolCall } from '@langchain/core/messages';
import { Command, END } from '@langchain/langgraph';
import { toolNames, graphNodes } from '../utils/constants.js';

/**
 * Extract compressed research notes from conduct_research tool messages
 */
function getNotesFromToolCalls(messages: BaseMessage[]): string[] {
  return messages
    .filter(msg => msg._getType() === 'tool' && msg.name === toolNames.delegateResearch)
    .map(msg => msg.content as string);
}

/**
 * Check if research should end based on various conditions
 */
function shouldEndResearch(
  state: ResearchLoopState,
  lastMessage: BaseMessage,
  maxIterations: number
): { shouldEnd: boolean; reason: string } {
  const researchIterations = state.researchIterations || 0;
  
  // Check 1: Exceeded max iterations
  if (researchIterations > maxIterations) {
    return { 
      shouldEnd: true, 
      reason: `Max iterations (${maxIterations}) reached` 
    };
  }
  
  // Check 2: No tool calls from supervisor (unusual case)
  // Note: Message can be AIMessage or AIMessageChunk, both have tool_calls
  const toolCalls = (lastMessage as any)?.tool_calls || [];
  const hasNoToolCalls = toolCalls.length === 0;
  if (hasNoToolCalls) {
    return { 
      shouldEnd: true, 
      reason: 'No tool calls from coordinator (no research conducted)' 
    };
  }
  
  // Check 3: Supervisor signaled completion
  const hasResearchComplete = toolCalls.some(
    (call: ToolCall) => call.name === toolNames.signalComplete
  );
  if (hasResearchComplete) {
    return { 
      shouldEnd: true, 
      reason: 'Research coordinator signaled complete' 
    };
  }
  
  return { shouldEnd: false, reason: '' };
}

/**
 * Process think_tool calls from supervisor (strategic reflections)
 */
function processThinkTools(toolCalls: ToolCall[]): ToolMessage[] {
  const thinkToolCalls = toolCalls.filter(
    (call: ToolCall) => call.name === toolNames.reflection
  );

  return thinkToolCalls.map(toolCall => {
    const reflection = toolCall.args.reflection;
    console.log(`\n💭 Research coordinator thinking: ${reflection.substring(0, 100)}...`);
    
    return new ToolMessage({
      content: `Reflection recorded: ${reflection}`,
      tool_call_id: toolCall.id || 'unknown',
      name: 'think_tool',
    });
  });
}

/**
 * Execute research tasks in parallel with concurrency limits
 */
async function executeResearchTasks(
  toolCalls: ToolCall[],
  config: AgentConfig
): Promise<{ toolMessages: ToolMessage[]; newRawNotes: string[] }> {
  const conductResearchCalls = toolCalls.filter(
    (call: ToolCall) => call.name === toolNames.delegateResearch
  );

  if (conductResearchCalls.length === 0) {
    return { toolMessages: [], newRawNotes: [] };
  }

  const maxConcurrent = config.maxConcurrentResearchUnits || 3;
  const allowedCalls = conductResearchCalls.slice(0, maxConcurrent);

  console.log(`\n📚 Delegating ${allowedCalls.length} research task(s)...`);

  // Execute allowed research tasks in parallel
  const researchPromises = allowedCalls.map((toolCall: any) =>
    executeResearchTask(toolCall.args.research_topic, config)
  );
  const results = await Promise.all(researchPromises);

  // Create tool messages for successful research
  const successMessages = allowedCalls.map((toolCall, i) => {
    return new ToolMessage({
      content: results[i].compressedResearch,
      tool_call_id: toolCall.id || 'unknown',
      name: toolNames.delegateResearch,
    });
  });

  // Extract raw notes from results
  const newRawNotes = results
    .flatMap((r: any) => r.rawNotes)
    .filter(Boolean);

  return {
    toolMessages: [...successMessages],
    newRawNotes
  };
}

/**
 * Research executor node - executes research tasks delegated by the supervisor
 * 
 * This node orchestrates the research execution phase by:
 * 1. Checking if research should end (max iterations, completion signal, or no tools)
 * 2. Extracting tool calls from supervisor's message
 * 3. Processing think_tool calls (strategic reflections from supervisor)
 * 4. Executing conduct_research calls in parallel (with concurrency limits)
 * 5. Accumulating research findings (notes and raw notes)
 * 6. Routing back to supervisor (continue loop) or ending research phase
 * 
 * @returns Command object with routing decision and state updates
 */
export async function coordinatorTools(
  state: ResearchLoopState,
  config: AgentConfig
): Promise<Command> {
  try {
    // === STEP 1: Check if research should end ===
    const researchLoopMessages = state.researchLoopMessages || [];
    const lastMessage = researchLoopMessages[researchLoopMessages.length - 1];
    const maxIterations = config.maxResearcherIterations || 10;

    const { shouldEnd, reason } = shouldEndResearch(state, lastMessage, maxIterations);
    
    if (shouldEnd) {
      console.log('\n✅ Research phase complete');
      console.log(`   Reason: ${reason}`);
      
      return new Command({
        update: {
          notes: getNotesFromToolCalls(researchLoopMessages),
          researchBrief: state.researchBrief,
        },
        goto: END
      });
    }

    // === STEP 2: Extract tool calls from supervisor's message ===
    const aiMessage = lastMessage as AIMessage;
    const toolCalls = aiMessage.tool_calls || [];

    // === STEP 3: Process think_tool calls (strategic reflections) ===
    const thinkMessages = processThinkTools(toolCalls);

    // === STEP 4: Execute conduct_research calls in parallel ===
    const { toolMessages: researchMessages, newRawNotes } = await executeResearchTasks(
      toolCalls,
      config
    );

    // === STEP 5: Combine all tool messages and update state ===
    const allToolMessages = [...thinkMessages, ...researchMessages];
    const updatePayload: Partial<ResearchLoopState> = {
      researchLoopMessages: [...researchLoopMessages, ...allToolMessages],
    };

    // Accumulate raw notes if any new ones were collected
    if (newRawNotes.length > 0) {
      updatePayload.rawNotes = [...(state.rawNotes || []), ...newRawNotes];
    }

    // === STEP 6: Continue research loop - route back to supervisor ===
    return new Command({
      update: updatePayload,
      goto: graphNodes.researchLoop.researchCoordinator
    });
  } catch (error) {
    console.error('❌ Research executor error:', error);
    return new Command({
      update: {
        notes: getNotesFromToolCalls(state.researchLoopMessages || []),
        researchBrief: state.researchBrief,
      },
      goto: END as any
    });
  }
}

