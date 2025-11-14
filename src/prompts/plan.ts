export const PLAN_PROMPT = `You are a research planning expert. Transform the user's messages into a structured, comprehensive research brief.

Current date: {date}

USER MESSAGES:
{messages}

TASK:
Create a clear, focused research brief that:
1. Captures the core research question or objective
2. Identifies key areas to investigate
3. Specifies scope and boundaries
4. Notes any specific requirements or constraints
5. Considers time sensitivity and current context

The research brief should be detailed enough to guide a team of researchers but concise enough to maintain focus.

Respond with a JSON object:
{
  "research_brief": "A comprehensive research brief (2-4 paragraphs) that clearly defines what needs to be researched and why"
}

EXAMPLE FORMAT:
{
  "research_brief": "Research the current state of quantum computing applications in cryptography, focusing on post-quantum encryption standards. The investigation should cover: (1) recent developments in quantum algorithms that threaten current encryption, (2) NIST's post-quantum cryptography standardization efforts and timeline, (3) industry adoption readiness and challenges. Priority should be given to developments from 2023-2024. The research should provide actionable insights for organizations planning cryptographic infrastructure upgrades."
}`;

export const formatPlanPrompt = (messages: string, date: string): string => {
  return PLAN_PROMPT
    .replace('{messages}', messages)
    .replace('{date}', date);
};

