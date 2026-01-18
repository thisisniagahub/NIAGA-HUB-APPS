
export enum Tool {
  Chat = 'Chat',
  LiveConversation = 'Live Conversation',
  VideoGeneration = 'Video Generation',
  VideoAnalysis = 'Video Analysis',
  ComplexQuery = 'Complex Query',
  QuickTools = 'Quick Tools',
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
