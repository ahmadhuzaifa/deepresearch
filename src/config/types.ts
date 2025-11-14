export interface SearchConfig {
  provider: 'tavily' | 'serp' | 'brave';
  maxResults: number;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AgentConfig {
  model: ModelConfig;
  search: SearchConfig;
  maxSubagents: number;
  maxToolCalls: number;
  timeout: number;
  allowClarification?: boolean;
  maxResearcherIterations?: number;
  maxConcurrentResearchUnits?: number;
  maxReactToolCalls?: number;
  compressionModel?: ModelConfig;
  maxStructuredOutputRetries?: number;
}

export const DEFAULT_CONFIG: AgentConfig = {
  model: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.1,
    maxTokens: 4096
  },
  search: {
    provider: 'tavily',
    maxResults: 3
  },
  maxSubagents: 5,
  maxToolCalls: 10,
  timeout: 300000,
  allowClarification: true,
  maxResearcherIterations: 10,
  maxConcurrentResearchUnits: 3,
  maxReactToolCalls: 15,
  maxStructuredOutputRetries: 3
};