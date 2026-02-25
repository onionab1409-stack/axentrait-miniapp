export type AiScenarioMeta = {
  key: string;
  displayName: string;
  displayDescription: string;
  icon: string;
  estimatedTime: string;
  requiredInputHint: string;
  outputFormat: 'json' | 'text';
  maxTurns: number;
};

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}
