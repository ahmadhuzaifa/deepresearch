# Deep Research Agent

A multi-agent research system built with LangGraph that accepts user queries, intelligently orchestrates parallel research, and generates comprehensive reports grounded in web search results.

## Features

- **Multi-Stage Research Workflow**: Clarification → Planning → Research → Synthesis
- **Parallel Research Execution**: Spawns multiple specialized research agents working concurrently
- **Web Search Integration**: Uses Tavily API for real-time web search
- **Flexible Configuration**: Customizable presets for different use cases
- **LangGraph Studio Support**: Visual workflow execution and debugging
- **Programmatic API**: Full TypeScript API for integration

## Quick Start

### Installation

```bash
bun install
```

### Environment Setup

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Add your API keys to `.env`:
- `OPENAI_API_KEY` - Required for LLM functionality
- `TAVILY_API_KEY` - Recommended for web search (get free key at [tavily.com](https://tavily.com))

### Running with LangGraph

The agent is designed to work with LangGraph Studio for visual debugging and execution:

```bash
# Start LangGraph Studio
langgraph dev
```

Then open http://localhost:8123 in your browser to interact with the agent visually.

### Programmatic Usage

```typescript
import { createResearchGraph } from './src/graph.js';
import { DEFAULT_CONFIG } from './src/config/types.js';
import { HumanMessage } from '@langchain/core/messages';

// Create the research graph
const graph = createResearchGraph(DEFAULT_CONFIG);

// Run research
const result = await graph.invoke({
  messages: [new HumanMessage("What are the latest developments in renewable energy?")]
});

console.log(result.finalReport);
```
