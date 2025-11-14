import { AgentConfig } from './types.js';

export const PRESETS: Record<string, Partial<AgentConfig>> = {
  quick: {
    maxSubagents: 2,
    maxToolCalls: 5,
    timeout: 120000, // 2 minutes
    model: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      maxTokens: 2048
    }
  },

  comprehensive: {
    maxSubagents: 5,
    maxToolCalls: 15,
    timeout: 600000, // 10 minutes
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 4096
    }
  },

  deep: {
    maxSubagents: 3,
    maxToolCalls: 20,
    timeout: 900000, // 15 minutes
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.05,
      maxTokens: 8192
    }
  }
};