import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ModelConfig } from "../config/types.js";

export function createModel(config: ModelConfig): BaseChatModel {
  const provider = config.provider || "openai";

  switch (provider) {
    case "anthropic":
      return new ChatAnthropic({
        modelName: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });

    case "openai":
    default:
      return new ChatOpenAI({
        modelName: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
  }
}